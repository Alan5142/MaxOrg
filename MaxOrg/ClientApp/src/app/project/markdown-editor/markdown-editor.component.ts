import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {MediaObserver} from "@angular/flex-layout";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatProgressBar, MatSnackBar} from "@angular/material";
import {Observable, Subject} from "rxjs";
import {UploadFileComponent} from "../messages/chat/upload-file/upload-file.component";
import {HttpEventType, HttpResponse} from "@angular/common/http";
import {GroupsService} from "../../services/groups.service";

@Component({
  selector: 'app-markdown-editor',
  templateUrl: './markdown-editor.component.html',
  styleUrls: ['./markdown-editor.component.scss']
})
export class MarkdownEditorComponent implements OnInit {
  @Input() groupId: string;
  @Input() title: string;
  @Input() okButtonText: string;
  @Input() defaultText: Observable<string>;
  text: string;
  @Output() saveClicked: EventEmitter<string> = new EventEmitter<string>();
  @Output() onCancel = new EventEmitter<void>();
  @ViewChild('fileInput') file: ElementRef<HTMLInputElement>;
  @ViewChild('imageInput') imageInput: ElementRef<HTMLInputElement>;
  value = 0;

  constructor(public mediaObserver: MediaObserver,
              private dialog: MatDialog,
              private groupService: GroupsService,
              private snackbar: MatSnackBar) {
  }

  ngOnInit() {
    if (this.defaultText !== undefined && this.defaultText !== null) {
      this.defaultText.subscribe(dt => this.text = dt);
    }
  }

  uploadFile() {
    this.file.nativeElement.click();
  }

  save() {
    this.saveClicked.next(this.text);
  }

  cancel() {
    this.onCancel.next();
  }

  addImage() {
    this.imageInput.nativeElement.click();
  }

  uploadFileToServer($event: any) {
    if ($event.target.files.length !== 1) {
      return;
    }

    const observable = this.groupService.uploadAttachment(this.groupId, $event.target.files[0]).subscribe(result => {
      if (result.type === HttpEventType.UploadProgress) {
        console.log('Progress');
        this.value = Math.round(100 * result.loaded / result.total);
      } else if (result instanceof HttpResponse) {
        const file = $event.target.files[0] as File;
        if (file.type.startsWith('image')) {
          this.text += `\n\n![${file.name}](${result.body.url})`;
        } else if (file.type.startsWith('video')) {
          this.text += `\n\n<video controls style="width: 100%; max-width: 500px" preload="metadata"><source src="${result.body.url}" type="${file.type}"></video>`;
        } else {
          this.text += `<br><br><a target="_blank" href="${result.body.url}" style="text-decoration: none; color: inherit; font-size: 2em"><i class="material-icons">file_copy</i>${file.name}</a>`
        }
        this.value = 0;
      }
    }, error => {
      this.snackbar.open('No se pudo subir', 'OK', {duration: 2000});
    });
  }
}
