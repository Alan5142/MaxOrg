import {Injectable} from '@angular/core';
import {User} from './user.service';
import {Observable} from 'rxjs';

export interface Message {
  sender: string;
  message: string;
}

export interface Chat {
  id: number;
  project: string;
  /**
   * @brief group name
   * null if it's a peer to peer chat
   */
  groupName: string | null;
  participants: User[];
  messages: Message[];
  /**
   * @brief not null for chat groups
   */
  admins: User[] | null;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor() {
  }

  getMessages(id: number): Chat {

    return null;
  }
}
