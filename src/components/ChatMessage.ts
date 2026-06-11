import { Block } from '@/core/Block';
import type { Message } from '@/utils/chats';

export interface ChatMessageProps {
  message: Message;
  currentUserId: string;
}

export class ChatMessage extends Block<ChatMessageProps> {
  protected render(): HTMLElement {
    const isMine = this.props.message.authorId === this.props.currentUserId;
    const row = this.createElement('div', [
      'message',
      isMine ? 'message--out' : 'message--in',
    ]);

    if (!isMine) {
      const author = this.createElement('div', ['message__author']);
      author.textContent = this.props.message.authorName;
      row.appendChild(author);
    }

    const text = this.createElement('span');
    text.textContent = this.props.message.text;
    row.appendChild(text);

    const time = this.createElement('span', ['message__time']);
    time.textContent = new Date(this.props.message.ts).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    row.appendChild(time);

    return row;
  }
}
