import {User} from "../../services/user.service";

export interface MessageModel {
  remitent: string;
  date: Date;
  type: string;
  data: string;
}
