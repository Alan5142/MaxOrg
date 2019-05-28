export enum MessageType {
  Text,
  Image,
  Video,
  Other
}


export interface Message {
  sender: string;
  date: Date;
  type: MessageType;
  data: string;
  attachmentName?: string;
  senderId: string;
}

export interface ChatModel {
  key: string;
  messages: Array<Message>;
  isGroup: boolean;
  name: string;
  description: string;
}

export interface GetUserChatsResponse {
  groupChats: ChatModel[];
  pairChats: ChatModel[];
}
