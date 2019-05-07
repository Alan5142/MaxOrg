import {Component, OnInit} from '@angular/core';
import {MediaObserver} from '@angular/flex-layout';
import {ActivatedRoute} from '@angular/router';
import {merge, Observable} from "rxjs";
import {GetUserChatsResponse} from "../services/chat-model";
import {ChatService} from "../services/chat.service";
import {shareReplay} from "rxjs/operators";
import {MatDialog, MatSnackBar} from "@angular/material";
import {CreateChatGroupComponent} from "./create-chat-group/create-chat-group.component";
import {ProjectsService} from "../../services/projects.service";

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {
  chatId: string = null;
  chats: Observable<GetUserChatsResponse>;
  groupId: string;

  constructor(private route: ActivatedRoute,
              public mediaObserver: MediaObserver,
              private dialog: MatDialog,
              private snackbar: MatSnackBar,
              private projectService: ProjectsService,
              private chatService: ChatService) {
    this.chatId = null;
    this.route.queryParamMap
      .subscribe(params => {
        this.chatId = params.get('chatId');
      });
    this.route.parent.params.subscribe(params => {
      this.groupId = params['id'];
      this.chats = chatService.userChats(this.groupId).pipe(shareReplay(1));
    })
  }

  ngOnInit() {
  }

  createGroup() {
    this.projectService.getAllUsersOfProject(this.groupId).subscribe(users => {
      const dialog = this.dialog.open(CreateChatGroupComponent, {
        data: {
          members: users.members
        }
      });
      dialog.afterClosed().subscribe(newGroupInfo => {
        if (newGroupInfo !== undefined) {
          this.chatService.createChat(newGroupInfo.name, this.groupId, newGroupInfo.members, true).subscribe(r => {
            this.snackbar.open('Chat creado con exito', 'OK', {duration: 2000});
            const newChats = this.chatService.userChats(this.groupId).pipe(shareReplay(1));
            this.chats = merge(this.chats, newChats);
          }, error => {
            const newChats = this.chatService.userChats(this.groupId).pipe(shareReplay(1));
            this.snackbar.open('No se pudo crear el chat', 'OK', {duration: 2000});
            this.chats = merge(this.chats, newChats);
          });
        }
      });
    });

  }
}
