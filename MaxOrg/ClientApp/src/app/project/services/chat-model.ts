export enum MessageType {
  Text,
  Image,
  Video,
  Other
}


export interface Message {
  remitent: string;
  date: Date;
  type: MessageType;
  data: string;
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
