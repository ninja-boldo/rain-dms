// workers/QueueHandler.ts
import amqp, {
  Connection,
  Channel,
  ConfirmChannel,
  Message,
  ConsumeMessage,
  Replies,
} from "amqplib";
import "dotenv/config";
import { QueueNames, QueueStats, OcrResult } from "../utils/types/main";
import crypto from "crypto";

export class PermanentFailureError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PermanentFailureError";
  }
}

interface ConsumerOptions {
  noAck?: boolean;
  manualAck?: boolean;
}

class RollingCounter {
  private events: number[] = [];
  total = 0;

  record() {
    const now = Date.now();
    this.events.push(now);
    this.total++;
    const cutoff = now - 60_000;
    let i = 0;
    while (i < this.events.length && this.events[i] < cutoff) i++;
    if (i > 0) this.events.splice(0, i);
  }

  ratePerSec(windowMs: number): number | null {
    const now = Date.now();
    const cutoff = now - windowMs;
    const recent = this.events.filter((t) => t >= cutoff).length;
    if (recent === 0) return null;
    return recent / (windowMs / 1000);
  }

  lastEventAt(): number | null {
    return this.events.length > 0 ? this.events[this.events.length - 1] : null;
  }
}

export interface WorkerDownloadEntry {
  filename: string;
  bytes: number;
  at: number;
}

export interface WorkerDownloadRecord {
  ip: string;
  totalDownloads: number;
  totalBytes: number;
  firstSeenAt: number;
  lastSeenAt: number;
  recentFiles: WorkerDownloadEntry[];
}

export interface ConsumerDetail {
  consumerTag: string;
  queue: string;
  peerHost: string;
  peerPort: number;
  prefetchCount: number;
  ackRequired: boolean;
  channelNumber: number;
  connectionName: string;
}

export interface PeekedMessage {
  payload: string;
  size: number;
  redelivered: boolean;
  routingKey: string;
  exchange: string;
}

type ConsumerCallback<T> = (
  data: T,
  raw: ConsumeMessage,
) => Promise<void> | void;

interface ConsumerRegistration {
  queueName: string;
  callback: ConsumerCallback<any>;
  options: ConsumerOptions;
}

export class QueueHandler {
  private connection: Connection | null = null;
  private channel: ConfirmChannel | null = null;
  private isShuttingDown = false;

  private managementUrl: string;
  private managementAuth: string;
  private vhost: string = "/";
  private clientCreatedAt = Date.now();

  private counters = {
    published: new RollingCounter(),
    acked: new RollingCounter(),
    nacked: new RollingCounter(),
    consumed: new RollingCounter(),
    agentDownloads: new RollingCounter(),
  };

  private workerDownloads = new Map<string, WorkerDownloadRecord>();
  private inFlightMessages = 0;
  private consumerRegistrations: ConsumerRegistration[] = [];

  constructor(
    managementUrl: string,
    credentials: { username: string; password: string },
    vhost = "/",
  ) {
    this.managementUrl = managementUrl.replace(/\/$/, "");
    this.managementAuth = Buffer.from(
      `${credentials.username}:${credentials.password}`,
    ).toString("base64");
    this.vhost = vhost;
  }

  private ensureChannel(): asserts this is this & { channel: ConfirmChannel } {
    if (!this.channel)
      throw new Error("Channel not initialized. Use QueueHandler.create()");
  }

  private async connect(): Promise<void> {
    if (!process.env.AMQP_URL) throw new Error("AMQP_URL is missing");

    const urlObj = new URL(process.env.AMQP_URL);
    urlObj.searchParams.set("heartbeat", "60");
    const balancedUrl = urlObj.toString();

    console.log(`[QueueHandler]: Connecting to broker at ${urlObj.host}...`);
    this.connection = await amqp.connect(balancedUrl, { timeout: 20000 });

    this.connection.on("error", (err) => {
      console.error("⚠️ [QueueHandler]: Connection error:", err.message);
      if (!this.isShuttingDown) this.scheduleReconnect();
    });

    this.connection.on("close", (err) => {
      console.warn("🛑 [QueueHandler]: Connection closed:", err?.message);
      if (!this.isShuttingDown) this.scheduleReconnect();
    });

    this.connection.on("blocked", (reason) => {
      console.warn("[QueueHandler]: Connection blocked:", reason);
    });

    this.connection.on("unblocked", () => {
      console.log("[QueueHandler]: Connection unblocked");
    });

    const baseChannel = await this.connection.createConfirmChannel();
    this.channel = baseChannel;

    this.channel.on("error", (err) => {
      console.error("⚠️ [QueueHandler]: Channel error:", err.message);
      if (!this.isShuttingDown) this.scheduleReconnect();
    });

    this.channel.on("close", () => {
      console.warn("🛑 [QueueHandler]: Channel closed");
      if (!this.isShuttingDown) this.scheduleReconnect();
    });

    await this.channel.prefetch(1);

    // Re-register all consumers safely from cached specifications without duplicating array elements
    const registrationsToRestore = [...this.consumerRegistrations];
    this.consumerRegistrations = [];
    for (const reg of registrationsToRestore) {
      await this.addQueueOnReceive(reg.queueName, reg.callback, reg.options);
    }

    console.log("[QueueHandler]: Reconnected and consumers re-registered");
  }

  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 5000;

  private scheduleReconnect(): void {
    if (this.isShuttingDown) return;
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(
        "[QueueHandler]: Max reconnection attempts reached. Giving up.",
      );
      return;
    }
    this.reconnectAttempts++;
    console.log(
      `[QueueHandler]: Scheduling reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${this.reconnectDelay}ms...`,
    );
    setTimeout(async () => {
      try {
        await this.connect();
        this.reconnectAttempts = 0;
      } catch (err) {
        console.error("[QueueHandler]: Reconnection failed:", err);
        this.scheduleReconnect();
      }
    }, this.reconnectDelay);
  }

  static async create(
    url = process.env.AMQP_URL,
    customPrefetch = 1,
    managementUrl = process.env.RABBITMQ_MANAGEMENT_URL ||
      "http://localhost:15672",
    credentials = {
      username: process.env.RABBITMQ_USER || "guest",
      password: process.env.RABBITMQ_PASS || "guest",
    },
    vhost = "/",
  ): Promise<QueueHandler> {
    const instance = new QueueHandler(managementUrl, credentials, vhost);
    await instance.connect();

    for (const queueName of Object.values(QueueNames)) {
      await instance.assertQueue(queueName);
    }

    return instance;
  }

  private encodedVhost() {
    return this.vhost === "/" ? "%2F" : encodeURIComponent(this.vhost);
  }

  private async mgmtGet(path: string) {
    const res = await fetch(`${this.managementUrl}/api${path}`, {
      headers: { Authorization: `Basic ${this.managementAuth}` },
    });
    if (!res.ok)
      throw new Error(
        `Management API ${path} → ${res.status} ${res.statusText}`,
      );
    return res.json();
  }

  private async fetchQueueData(queueName: string) {
    return this.mgmtGet(
      `/queues/${this.encodedVhost()}/${encodeURIComponent(queueName)}`,
    );
  }

  async getConsumerDetails(queueName: string): Promise<ConsumerDetail[]> {
    const all = await this.mgmtGet(`/consumers/${this.encodedVhost()}`);
    return (all as any[])
      .filter((c: any) => c.queue?.name === queueName)
      .map((c: any) => ({
        consumerTag: c.consumer_tag ?? "?",
        queue: c.queue?.name ?? queueName,
        peerHost: c.channel_details?.peer_host ?? "?",
        peerPort: c.channel_details?.peer_port ?? 0,
        prefetchCount: c.prefetch_count ?? 0,
        ackRequired: !c.ack_required === false,
        channelNumber: c.channel_details?.number ?? 0,
        connectionName: c.channel_details?.connection_name ?? "?",
      }));
  }

  async getChannelStats(): Promise<
    Record<string, { ackRate: number; publishRate: number; unacked: number }>
  > {
    const channels = await this.mgmtGet("/channels");
    const result: Record<
      string,
      { ackRate: number; publishRate: number; unacked: number }
    > = {};
    for (const ch of channels as any[]) {
      const name = ch.connection_details?.peer_host
        ? `${ch.connection_details.peer_host}:${ch.connection_details.peer_port}`
        : ch.name;
      result[name] = {
        ackRate: ch.message_stats?.ack_details?.rate ?? 0,
        publishRate: ch.message_stats?.publish_details?.rate ?? 0,
        unacked: ch.messages_unacknowledged ?? 0,
      };
    }
    return result;
  }

  async peekMessages(queueName: string, count = 5): Promise<PeekedMessage[]> {
    const vhost = this.encodedVhost();
    const res = await fetch(
      `${this.managementUrl}/api/queues/${vhost}/${encodeURIComponent(queueName)}/get`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${this.managementAuth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          count,
          ackmode: "ack_requeue_true",
          encoding: "auto",
          truncate: 200,
        }),
      },
    );
    if (!res.ok) throw new Error(`Peek failed: ${res.status}`);
    const msgs = (await res.json()) as any[];
    return msgs.map((m) => ({
      payload:
        typeof m.payload === "string"
          ? m.payload.slice(0, 200)
          : JSON.stringify(m.payload).slice(0, 200),
      size: m.payload_bytes ?? 0,
      redelivered: m.redelivered ?? false,
      routingKey: m.routing_key ?? "",
      exchange: m.exchange ?? "",
    }));
  }

  async getQueueStats(queueName: string): Promise<QueueStats> {
    this.ensureChannel();
    try {
      const queueData = await this.fetchQueueData(queueName);
      const totalConsumers = queueData.consumers ?? 0;
      const busyConsumers = Math.min(totalConsumers, this.inFlightMessages);
      return {
        queue: queueName,
        messages: queueData.messages ?? 0,
        readyMessages: queueData.messages_ready ?? 0,
        unackedMessages: queueData.messages_unacknowledged ?? 0,
        consumers: totalConsumers,
        busyConsumers,
        idleConsumers: Math.max(totalConsumers - busyConsumers, 0),
        published: this.counters.published.total,
        consumed: this.counters.consumed.total,
        acked: this.counters.acked.total,
        nacked: this.counters.nacked.total,
        inFlightMessages: this.inFlightMessages,
        ackRatePerSec: this.counters.acked.ratePerSec(30_000) ?? 0,
        publishRatePerSec: this.counters.published.ratePerSec(30_000) ?? 0,
        consumeRatePerSec: this.counters.consumed.ratePerSec(30_000) ?? 0,
        nackRatePerSec: this.counters.nacked.ratePerSec(30_000) ?? 0,
        clientUptimeMs: Date.now() - this.clientCreatedAt,
        createdAt: this.clientCreatedAt,
        lastMessageAt: this.counters.acked.lastEventAt(),
        processingBacklog:
          (queueData.messages_ready ?? 0) > totalConsumers * 20,
      };
    } catch (e: any) {
      return {
        queue: queueName,
        messages: 0,
        readyMessages: 0,
        unackedMessages: 0,
        consumers: 0,
        busyConsumers: 0,
        idleConsumers: 0,
        published: this.counters.published.total,
        consumed: this.counters.consumed.total,
        acked: this.counters.acked.total,
        nacked: this.counters.nacked.total,
        inFlightMessages: this.inFlightMessages,
        ackRatePerSec: 0,
        publishRatePerSec: 0,
        consumeRatePerSec: 0,
        nackRatePerSec: 0,
        clientUptimeMs: Date.now() - this.clientCreatedAt,
        createdAt: this.clientCreatedAt,
        lastMessageAt: null,
        processingBacklog: false,
      };
    }
  }

  recordAgentDownload(ip: string, filename: string, bytes: number) {
    this.counters.agentDownloads.record();
    const entry: WorkerDownloadEntry = { filename, bytes, at: Date.now() };
    const existing = this.workerDownloads.get(ip);
    if (!existing) {
      this.workerDownloads.set(ip, {
        ip,
        totalDownloads: 1,
        totalBytes: bytes,
        firstSeenAt: Date.now(),
        lastSeenAt: Date.now(),
        recentFiles: [entry],
      });
    } else {
      existing.totalDownloads++;
      existing.totalBytes += bytes;
      existing.lastSeenAt = Date.now();
      existing.recentFiles.push(entry);
      if (existing.recentFiles.length > 20) existing.recentFiles.shift();
    }
  }

  getWorkerDownloadStats(): WorkerDownloadRecord[] {
    return Array.from(this.workerDownloads.values()).sort(
      (a, b) => b.lastSeenAt - a.lastSeenAt,
    );
  }

  getLocalMetrics() {
    const ack30 = this.counters.acked.ratePerSec(30_000);
    const ack60 = this.counters.acked.ratePerSec(60_000);
    const dl30 = this.counters.agentDownloads.ratePerSec(30_000);
    const dl60 = this.counters.agentDownloads.ratePerSec(60_000);
    return {
      pages_per_minute_30s: ack30 !== null ? ack30 * 60 : null,
      pages_per_minute_60s: ack60 !== null ? ack60 * 60 : null,
      agent_downloads_per_minute_30s: dl30 !== null ? dl30 * 60 : null,
      agent_downloads_per_minute_60s: dl60 !== null ? dl60 * 60 : null,
      in_flight: this.inFlightMessages,
      total_acked: this.counters.acked.total,
      total_downloads: this.counters.agentDownloads.total,
      last_ack_at: this.counters.acked.lastEventAt(),
    };
  }

  async assertQueue(queueName: string): Promise<Replies.AssertQueue> {
    this.ensureChannel();
    const poisonQueueName = `${queueName}_poison`;
    await this.channel.assertQueue(poisonQueueName, { durable: true });
    return this.channel.assertQueue(queueName, {
      durable: true,
      arguments: {
        "x-queue-type": "quorum",
        "x-delivery-limit": 5,
        "x-dead-letter-exchange": "",
        "x-dead-letter-routing-key": poisonQueueName,
        "x-message-deduplication": true,
      },
    });
  }

  async sendMsg(
    message: string | object,
    queueName: string,
    opts = { persistent: true },
  ): Promise<void> {
    this.ensureChannel();
    const payload =
      typeof message === "string" ? message : JSON.stringify(message);
    const messageId = crypto.createHash("md5").update(payload).digest("hex");
    await new Promise<void>((resolve, reject) => {
      if (!this.channel)
        return reject(
          new Error(
            "[QueueHandler]: Channel dropped before delivery completed",
          ),
        );
      this.channel.sendToQueue(
        queueName,
        Buffer.from(payload),
        { ...opts, messageId },
        (err, ok) => {
          if (err)
            return reject(
              new Error(`[Queue] Message rejected by broker: ${err.message}`),
            );
          this.counters.published.record();
          resolve();
        },
      );
    });
  }

  async addQueueOnReceive<T = unknown>(
    queueName: string,
    onReceive: (data: T, raw: ConsumeMessage) => Promise<void> | void,
    options: ConsumerOptions = {},
  ): Promise<void> {
    this.ensureChannel();
    const { noAck = false, manualAck = false } = options;
    await this.assertQueue(queueName);

    // Check configuration arrays before pushing to avoid reconnection allocation duplication
    const trackingExists = this.consumerRegistrations.some(
      (reg) => reg.queueName === queueName && reg.callback === onReceive,
    );
    if (!trackingExists) {
      this.consumerRegistrations.push({
        queueName,
        callback: onReceive,
        options,
      });
    }

    await this.channel.consume(
      queueName,
      async (msg) => {
        if (!msg) return;
        this.inFlightMessages++;
        this.counters.consumed.record();
        try {
          const content = msg.content.toString();
          let parsed: T;
          try {
            parsed = JSON.parse(content);
          } catch {
            parsed = content as T;
          }
          await onReceive(parsed, msg);
          if (!noAck && !manualAck && this.channel && !this.channel.closed) {
            this.channel.ack(msg);
            this.counters.acked.record();
          }
        } catch (err) {
          this.counters.nacked.record();
          if (!noAck && !manualAck && this.channel && !this.channel.closed) {
            if (err instanceof PermanentFailureError) {
              console.error(
                "[Queue] Permanent failure — routing to poison queue:",
                err.message,
              );
              this.channel.nack(msg, false, false);
            } else {
              console.error(
                "[Queue] Transient failure — requeueing for retry:",
                err,
              );
              this.channel.nack(msg, false, true);
            }
          }
        } finally {
          this.inFlightMessages--;
        }
      },
      { noAck },
    );
  }

  ack(msg: Message): void {
    this.ensureChannel();
    if (this.channel && !this.channel.closed) {
      this.channel.ack(msg);
      this.counters.acked.record();
    }
  }

  nack(msg: Message, requeue = false): void {
    this.ensureChannel();
    if (this.channel && !this.channel.closed) {
      this.channel.nack(msg, false, requeue);
      this.counters.nacked.record();
    }
  }

  async close(): Promise<void> {
    this.isShuttingDown = true;
    if (this.channel) {
      await this.channel.close().catch(() => {});
      this.channel = null;
    }
    if (this.connection) {
      await this.connection.close().catch(() => {});
      this.connection = null;
    }
  }
}
