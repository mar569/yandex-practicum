import { EventBus } from "./EventBus";
import type { User } from "@/utils/auth";
import type { Chat, Message } from "@/utils/chats";

export interface StoreState {
  user: User | null;
  chats: Chat[];
  selectedChatId: string | null;
  messages: Message[];
  currentChatUsers: User[];
}

export enum StoreEvents {
  Updated = "updated",
  UserChanged = "userChanged",
  ChatsChanged = "chatsChanged",
  MessagesChanged = "messagesChanged",
}

const DEFAULT_STATE: StoreState = {
  user: null,
  chats: [],
  selectedChatId: null,
  messages: [],
  currentChatUsers: [],
};

export class Store extends EventBus {
  private state: StoreState = { ...DEFAULT_STATE };

  public getState(): StoreState {
    return this.state;
  }

  public setState(nextState: Partial<StoreState>): void {
    this.state = { ...this.state, ...nextState };
    this.emit(StoreEvents.Updated, this.state);
    if (nextState.user !== undefined) {
      this.emit(StoreEvents.UserChanged, this.state.user);
    }
    if (nextState.chats !== undefined) {
      this.emit(StoreEvents.ChatsChanged, this.state.chats);
    }
    if (nextState.messages !== undefined) {
      this.emit(StoreEvents.MessagesChanged, this.state.messages);
    }
  }

  public set<K extends keyof StoreState>(key: K, value: StoreState[K]): void {
    this.state = { ...this.state, [key]: value } as StoreState;
    this.emit(key, value);
    this.emit(StoreEvents.Updated, this.state);
  }
}

export const store = new Store();
