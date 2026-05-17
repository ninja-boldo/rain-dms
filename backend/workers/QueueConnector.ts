import amqp, { Connection, Channel, Message } from "amqplib";
import "dotenv/config";

export class QueueHandler {
  private connection: Connection | null = null;
  private channel: Channel | null = null;

  private _ensureChannel() {
    if (!this.channel)
      throw new Error("Channel not initialized. Use QueueHandler.create()");
  }

  static async create(url = process.env.AMQP_URL): Promise<QueueHandler> {
    const instance = new QueueHandler();
    instance.connection = await amqp.connect(url);
    instance.channel = await instance.connection.createChannel();
    // optional: set sensible defaults
    await instance.channel.prefetch(10);
    return instance;
  }

  async getQueueStats(queueName: string) {
    this._ensureChannel();

    const res = await this.channel!.assertQueue(queueName, {
      durable: true,
      arguments: { "x-queue-type": "quorum" },
    });

    return {
      queue: queueName,
      messages: res.messageCount,
      consumers: res.consumerCount,
    };
  }

  async sendMsg(
    message: string | object,
    queueName: string,
    opts = { persistent: true },
  ): Promise<void> {
    this._ensureChannel();
    const payload =
      typeof message === "string" ? message : JSON.stringify(message);
    await this.channel!.assertQueue(queueName, {
      durable: true,
      arguments: { "x-queue-type": "quorum" },
    });
    // sendToQueue returns boolean (buffer full); if you need confirms, use a ConfirmChannel
    const ok = this.channel!.sendToQueue(queueName, Buffer.from(payload), opts);
    if (!ok) {
      // if the internal buffer is full, wait for 'drain' (optional)
      await new Promise<void>((resolve) =>
        this.channel!.once("drain", () => resolve()),
      );
    }
    console.log(" [x] Sent %s", payload);
  }

  async addQueueOnReceive<T = any>(
    queueName: string,
    onReceive: (data: T, raw: Message) => Promise<void> | void,
    { noAck = false } = {},
  ): Promise<void> {
    this._ensureChannel();
    await this.channel!.assertQueue(queueName, {
      durable: true,
      arguments: { "x-queue-type": "quorum" },
    });

    console.log(
      " [*] Waiting for messages in %s. To exit press CTRL+C",
      queueName,
    );

    await this.channel!.assertQueue(queueName, {
      durable: true,
      arguments: { "x-queue-type": "quorum" },
    });

    await this.channel!.consume(
      queueName,
      async (msg) => {
        if (!msg) return;
        try {
          const content = msg.content.toString();
          let parsed: any = content;
          try {
            parsed = JSON.parse(content);
          } catch {}
          await onReceive(parsed, msg);
          if (!noAck) this.channel!.ack(msg);
        } catch (err) {
          console.error("Message handler error:", err);
          if (!noAck) this.channel!.nack(msg, false, false); // change policy if needed
        }
      },
      { noAck },
    );
  }

  ack(msg: Message) {
    this._ensureChannel();
    this.channel!.ack(msg);
  }
  nack(msg: Message, requeue = false) {
    this._ensureChannel();
    this.channel!.nack(msg, false, requeue);
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
