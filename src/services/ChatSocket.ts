import { chatsApi } from "@/api/chats";

export interface ChatSocketMessage {
  type: string;
  content: string;
  user_id?: string;
  id?: string;
  time?: string;
  file?: Record<string, unknown>;
}

export type ChatSocketMessageListener = (
  message: ChatSocketMessage | ChatSocketMessage[],
) => void;

export class ChatSocket {
  private socket: WebSocket | null = null;
  private pingTimer: number | null = null;
  private reconnectTimer: number | null = null;
  private chatId: string | null = null;
  private listener: ChatSocketMessageListener;

  constructor(listener: ChatSocketMessageListener) {
    this.listener = listener;
  }

  public async connect(chatId: string): Promise<void> {
    this.chatId = chatId;
    try {
      const tokenResponse = await chatsApi.getToken(chatId);
      const token = (tokenResponse as { token?: string }).token;

      if (!token) {
        console.error("ChatSocket: Failed to get token for chat", chatId);
        throw new Error("Failed to get WebSocket token");
      }

      const url = this.buildUrl(chatId, token);
      console.log("ChatSocket: Connecting to", url);
      console.log("ChatSocket: Token (first 10 chars)", token.substring(0, 10) + "...");
      console.log("ChatSocket: Current cookies", document.cookie);

      await this.disconnect();

      this.socket = new WebSocket(url);
      this.socket.onopen = () => {
        console.log("ChatSocket: Connected to chat", chatId);
        this.startPing();
      };
      this.socket.onmessage = (event) => this.handleMessage(event.data);
      this.socket.onclose = (event) => {
        console.log("ChatSocket: Disconnected from chat", chatId, "Code:", event.code, "Reason:", event.reason);
        this.scheduleReconnect();
      };
      this.socket.onerror = (error) => {
        console.error("ChatSocket: Error on chat", chatId, error);
        this.scheduleReconnect();
      };
    } catch (error) {
      console.error("ChatSocket: Failed to connect", error);
      throw error;
    }
  }

  public disconnect(): Promise<void> {
    this.clearPing();
    if (!this.socket) return Promise.resolve();
    return new Promise((resolve) => {
      this.socket?.addEventListener("close", () => resolve(), { once: true });
      this.socket?.close();
      this.socket = null;
    });
  }

  public sendMessage(content: string): void {
    this.send({ type: "message", content });
  }

  public sendFileMessage(resourceId: string): void {
    this.send({ type: "file", content: resourceId });
  }

  public sendStickerMessage(stickerId: string): void {
    this.send({ type: "sticker", content: stickerId });
  }

  public getOldMessages(offset: string): void {
    this.send({ type: "get old", content: offset });
  }

  public ping(): void {
    this.send({ type: "ping", content: "" });
  }

  public reconnect(): void {
    if (!this.chatId) return;
    this.scheduleReconnect(0);
  }

  private buildUrl(chatId: string, token?: string): string {
    const actualToken = token ? String(token).trim() : undefined;
    if (!actualToken) {
      console.warn("ChatSocket: No token provided for chat", chatId);
      return `wss://ya-praktikum.tech/api/v2/chats/${chatId}`;
    }
    
    // Encode ONLY the colon to prevent browser interpreting it as port
    const encodedToken = actualToken.replace(/:/g, "%3A");
    
    // Always use direct connection to ya-praktikum.tech for WebSocket
    // (Vite proxy doesn't support WebSocket properly)
    return `wss://ya-praktikum.tech/api/v2/chats/${chatId}/${encodedToken}`;
  }

  private send(message: { type: string; content: string }): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
    this.socket.send(JSON.stringify(message));
  }

  private handleMessage(rawData: string): void {
    try {
      const parsed = JSON.parse(rawData);
      this.listener(parsed);
    } catch {
      // ignore malformed socket payloads
    }
  }

  private startPing(): void {
    this.clearPing();
    this.pingTimer = window.setInterval(() => this.ping(), 25000);
  }

  private clearPing(): void {
    if (this.pingTimer !== null) {
      window.clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  private scheduleReconnect(delay = 3000): void {
    if (this.reconnectTimer !== null) return;
    this.clearPing();
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      if (this.chatId) {
        void this.connect(this.chatId);
      }
    }, delay);
  }
}
