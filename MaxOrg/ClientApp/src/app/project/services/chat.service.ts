import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams, HttpRequest} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {ChatModel, GetUserChatsResponse, Message} from "./chat-model";
import {HubConnection, HubConnectionBuilder, LogLevel} from "@aspnet/signalr";
import {UserService} from "../../services/user.service";
import {from, Observable, Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private messageObserver = new Subject<Message>();
  hubConnection: HubConnection;
  private chatObservable: Observable<any>;
  private onConnected: Observable<any>;

  constructor(private http: HttpClient, private userService: UserService) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl('/chat-hub', {accessTokenFactory: () => userService.userToken, logger: LogLevel.None})
      .build();
    this.onConnected = from(this.hubConnection.start());
    this.onConnected.subscribe(ok => {
      this.hubConnection.on('receiveMessage', (message: Message) => {
        this.messageObserver.next(message);
      });
    });
  }

  get onConnectedObservable() {
    return this.onConnected;
  }

  public connect(chatId: string) {
    this.hubConnection.send('JoinGroup', chatId).then(() => {});

  }

  public disconnect(chatId: string) {
    this.hubConnection.send('DisconnectFromGroup', chatId);
  }

  get observeMessages() {
    return this.messageObserver.asObservable();
  }

  userChats(projectId: string) {
    const headers = new HttpHeaders().append('Authorization', `Bearer ${localStorage.getItem('token')}`);
    let params = new HttpParams().set('projectId', projectId);
    return this.http.get<GetUserChatsResponse>( `${environment.apiUrl}chats`,
      {
        headers: headers,
        params: params
      });
  }

  createChat(chatName: string, projectId: string, projectMembers: string[], isGroup: boolean) {
    return this.http.post(`${environment.apiUrl}chats`, {
        name: chatName,
        projectId: projectId,
        members: projectMembers,
        isGroup: isGroup
    });
  }

  getChatWithId(chatId: string) {
    const headers = new HttpHeaders().append('Authorization', `Bearer ${localStorage.getItem('token')}`);
    return this.http.get<ChatModel>( `${environment.apiUrl}chats/${chatId}`,
      {
        headers: headers
      });
  }

  sendMessage(chatId: string, message: string) {
    const formData: FormData = new FormData();
    formData.append('message', message);
    return this.http.post(`${environment.apiUrl}chats/${chatId}/messages`, formData);
  }

  public getAttachmentData(serverUrl: string): Observable<any> {
    return this.http.get<any>(serverUrl);
  }

  sendFile(chatId: string, file: File) {
    const formData = new FormData();
    formData.append('attachment', file);
    new HttpRequest('POST', `${environment.apiUrl}chats/${chatId}/messages`, formData, {
      reportProgress: true,
    });
    return this.http.post(`${environment.apiUrl}chats/${chatId}/messages`, formData, {
      reportProgress: true,
      observe: "events",
      headers: {'ngsw-bypass': ''}
    });
  }
}
