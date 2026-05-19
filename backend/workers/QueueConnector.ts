import amqp, {
  Connection,
  Channel,
  Message,
  ConsumeMessage,
  Replies,
} from "amqplib";
import "dotenv/config";
import { QueueStats } from "../utils/types/main";

interface ConsumerOptions {
  noAck?: boolean;
  manualAck?: boolean;
}

// ─── Dual-window rolling counter ──────────────────────────────
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

// ─── Per-worker download tracking ────────────────────────────

export interface WorkerDownloadEntry {
  filename: string;
  bytes: number;
  at: number; // unix ms
}

export interface WorkerDownloadRecord {
  ip: string;
  totalDownloads: number;
  totalBytes: number;
  firstSeenAt: number;
  lastSeenAt: number;
  /** Ring buffer, max 20 entries, newest last */
  recentFiles: WorkerDownloadEntry[];
}

// ─── Per-consumer stats from management API ───────────────────
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

export class QueueHandler {
  private connection: Connection | null = null;
  private channel: Channel | null = null;

  private managementUrl: string;
  private managementAuth: string;
  private vhost: string = "/";

  private readonly PREFETCH = 2;

  private counters = {
    published: new RollingCounter(),
    acked: new RollingCounter(),
    nacked: new RollingCounter(),
    consumed: new RollingCounter(),
    agentDownloads: new RollingCounter(),
  };

  // Per-IP download stats — persists for the lifetime of the process
  private workerDownloads = new Map<string, WorkerDownloadRecord>();

  private inFlightMessages = 0;
  private clientCreatedAt = Date.now();

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

  private ensureChannel(): asserts this is this & { channel: Channel } {
    if (!this.channel)
      throw new Error("Channel not initialized. Use QueueHandler.create()");
  }

  static async create(
    url = process.env.AMQP_URL,
    managementUrl = process.env.RABBITMQ_MANAGEMENT_URL ||
      "http://localhost:15672",
    credentials = {
      username: process.env.RABBITMQ_USER || "guest",
      password: process.env.RABBITMQ_PASS || "guest",
    },
    vhost = "/",
  ): Promise<QueueHandler> {
    if (!url) throw new Error("AMQP_URL is missing");
    const instance = new QueueHandler(managementUrl, credentials, vhost);
    instance.connection = await amqp.connect(url);
    instance.channel = await instance.connection.createChannel();
    await instance.channel.prefetch(instance.PREFETCH);
    return instance;
  }

  // ── Management API helpers ───────────────────────────────────

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
        (queueData.messages_ready ?? 0) > totalConsumers * this.PREFETCH,
    };
  }

  // ── Download tracking (per-worker IP) ────────────────────────

  /**
   * Call this from /download/consume.
   * @param ip      The OCR worker's IP address (from X-Forwarded-For or socket)
   * @param filename Basename of the file being served
   * @param bytes   File size in bytes (from fs.statSync)
   */
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
      // Keep only the 20 most recent files
      if (existing.recentFiles.length > 20) existing.recentFiles.shift();
    }
  }

  /** Returns all known workers sorted by most recently active. */
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

  // ── Queue AMQP operations ────────────────────────────────────

  async assertQueue(queueName: string): Promise<Replies.AssertQueue> {
    this.ensureChannel();
    return this.channel.assertQueue(queueName, {
      durable: true,
      arguments: { "x-queue-type": "quorum" },
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
    await this.assertQueue(queueName);
    const ok = this.channel.sendToQueue(queueName, Buffer.from(payload), opts);
    this.counters.published.record();
    if (!ok) await new Promise<void>((r) => this.channel!.once("drain", r));
  }

  async addQueueOnReceive<T = unknown>(
    queueName: string,
    onReceive: (data: T, raw: ConsumeMessage) => Promise<void> | void,
    options: ConsumerOptions = {},
  ): Promise<void> {
    this.ensureChannel();
    const { noAck = false, manualAck = false } = options;
    await this.assertQueue(queueName);

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
          if (!noAck && !manualAck) {
            this.channel!.ack(msg);
            this.counters.acked.record();
          }
        } catch (err) {
          console.error("Message handler error:", err);
          if (!noAck && !manualAck) {
            this.channel!.nack(msg, false, false);
            this.counters.nacked.record();
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
    this.channel.ack(msg);
    this.counters.acked.record();
  }

  nack(msg: Message, requeue = false): void {
    this.ensureChannel();
    this.channel.nack(msg, false, requeue);
    this.counters.nacked.record();
  }

  async close(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
      this.channel = null;
    }
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }
  }
}