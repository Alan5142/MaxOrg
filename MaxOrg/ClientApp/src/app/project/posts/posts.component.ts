import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ThemeService} from "../../services/theme.service";
import {PostsService} from "../../posts.service";
import {ActivatedRoute} from "@angular/router";
import {MatSnackBar} from "@angular/material";
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {HighlightService} from "../../services/highlight.service";
import {shareReplay} from "rxjs/operators";
import * as marked from 'marked/marked.min';
import * as sanitizeHtml from 'sanitize-html/dist/sanitize-html';
import {HttpEventType, HttpResponse} from "@angular/common/http";
import {GroupsService} from "../../services/groups.service";

@Component({
  selector: 'app-project-index',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostsComponent implements OnInit {
  private groupId: string;
  public posts;
  public value = 0;

  @ViewChild('fileInput') file: ElementRef<HTMLInputElement>;
  @ViewChild('newPost') newPost: ElementRef<HTMLInputElement>;

  constructor(public themeService: ThemeService,
              private postsService: PostsService,
              private route: ActivatedRoute,
              private snackbar: MatSnackBar,
              private highlighter: HighlightService,
              private sanitizer: DomSanitizer,
              private groupsService: GroupsService,
              public cdr: ChangeDetectorRef) {
    this.cdr.detach();
    this.route.parent.params.subscribe(params => {
      this.groupId = params['id'];
      this.postsService.getPosts(this.groupId).pipe(shareReplay(1)).subscribe(posts => {
        this.posts = posts;
        this.cdr.detectChanges();
      });
    });
  }

  ngOnInit() {
  }

  createPost(value: string) {
    this.postsService.createPost(this.groupId, value).subscribe(() => {
      this.snackbar.open('Creado con éxito', 'Ok', {duration: 2000});
      this.postsService.getPosts(this.groupId).pipe(shareReplay(1)).subscribe(posts => {
        this.posts = posts;
        this.cdr.detectChanges();
      });
    }, err => {
      this.cdr.detectChanges();
      this.snackbar.open('No se pudo crear', 'Ok', {duration: 2000});
    });
  }

  generateSafeHtml(content: string): SafeHtml {
    marked.setOptions({
      renderer: new marked.Renderer(),
      highlight: (code, lang) => {
        return this.highlighter.highlightCode(code, lang);
      },
      /*highlight: function(code) {
        return require('highlight.js').highlightAuto(code).value;
      },*/
      pedantic: false,
      gfm: true,
      tables: true,
      breaks: false,
      sanitize: false,
      smartLists: true,
      smartypants: false,
      xhtml: false
    });
    const html = marked(content);
    const cleanHtml = sanitizeHtml(html, {
      allowedTags: [
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'a',
        'b',
        'p',
        'i',
        'em',
        'strong',
        'blockquote',
        'big',
        'small',
        'div',
        'br',
        'hr',
        'li',
        'ol',
        'ul',
        'table',
        'tbody',
        'thead',
        'td',
        'th',
        'tr',
        'caption',
        'span',
        'img',
        'pre',
        'code',
        'video',
        'source'
      ],
      allowedAttributes: {
        'a': ['href', 'target', 'rel', 'style', 'class'],
        'img': ['src'],
        'span': ['class'],
        'code': ['class'],
        'pre': ['class', 'data-start', '*'],
        'video': ['preload', 'height', 'controls', 'style'],
        'source': ['src', 'type'],
        'i': ['class'],
        '*': ['href', 'align', 'alt', 'center', 'bgcolor', 'style']
      },
      transformTags: {
        'a': (tagName, attribs) => {
          // Always open links in a new window
          if (attribs) {
            attribs.target = '_blank';
            attribs.rel = 'noopener noreferrer';
          }
          if (attribs.href.startsWith('/api/groups')) {
            attribs.href += `?access_token=${localStorage.getItem('token')}`;
            attribs.style = "text-decoration: none; color: inherit; font-size: 2em";
          }
          return {tagName, attribs};
        },
        'pre': (tagName, attribs) => {
          if (attribs.class === undefined) {
            attribs.class = 'language- line-numbers';
          } else {
            attribs.class += 'language- line-numbers';
          }
          attribs['data-start'] = "1";

          return {tagName, attribs}
        },
        'img': (tagName, attribs) => {
          if (attribs.src.startsWith('/api/groups')) {
            attribs.src += `?access_token=${localStorage.getItem('token')}`;
          }
          attribs.style = 'width: 100%; max-width: 500px; height: auto';
          return {tagName, attribs};
        },
        'source': (tagName, attribs) => {
          if (attribs.src.startsWith('/api/groups')) {
            attribs.src += `?access_token=${localStorage.getItem('token')}`;
          }
          return {tagName, attribs};
        },
        'video': (tagName, attribs) => {
          attribs.style = 'width: 100%; max-width: 500px; height: auto';
          return {tagName, attribs};
        },

      },
      allowedStyles: {
        '*': {
          // Match HEX and RGB
          'color': [/^\#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/, /^(inherit$)/],
          'text-align': [/^left$/, /^right$/, /^center$/],
          // Match any number with px, em, or %
          'font-size': [/^\d+(?:px|em|%)$/],
          'text-decoration': [/^none$/]
        },
        'img': {
          'width': [/^\d+(?:px|em|%)$/],
          'height': [/^\d+(?:px|em|%)$/],
          'max-width': [/^\d+(?:px|em|%)$/],
          'max-height': [/^\d+(?:px|em|%)$/]
        },
        'video': {
          'width': [/^\d+(?:px|em|%)$/],
          'height': [/^\d+(?:px|em|%)$/],
          'max-width': [/^\d+(?:px|em|%)$/],
          'max-height': [/^\d+(?:px|em|%)$/]
        }
      }
    });
    return this.sanitizer.bypassSecurityTrustHtml(cleanHtml);
  }

  makeComment(id: string, value: string) {
    this.postsService.makeComment(this.groupId, id, value).subscribe(() => {
      this.postsService.getPosts(this.groupId).pipe(shareReplay(1)).subscribe(posts => {
        this.posts = posts;
        this.cdr.detectChanges();
      });
    }, () => {
      this.snackbar.open('No se pudo crear el comentario', 'Ok', {duration: 2000});
    });
  }

  uploadFileToServer($event: any) {
    if ($event.target.files.length !== 1) {
      return;
    }
    if (this.newPost.nativeElement.value === undefined) {
      this.newPost.nativeElement.value = '';
    }

    const observable = this.groupsService.uploadAttachment(this.groupId, $event.target.files[0]).subscribe(result => {
      if (result.type === HttpEventType.UploadProgress) {
        this.cdr.detectChanges();
        this.value = Math.round(100 * result.loaded / result.total);
      } else if (result instanceof HttpResponse) {
        const file = $event.target.files[0] as File;
        if (file.type.startsWith('image')) {
          this.newPost.nativeElement.value += `\n\n![${file.name}](${result.body.url})`;
        } else if (file.type.startsWith('video')) {
          this.newPost.nativeElement.value += `\n\n<video controls style="width: 100%; max-width: 500px" preload="metadata"><source src="${result.body.url}" type="${file.type}"></video>`;
        } else {
          this.newPost.nativeElement.value += `<br><br><a target="_blank" href="${result.body.url}" style="text-decoration: none; color: inherit; font-size: 2em"><i class="material-icons">file_copy</i>${file.name}</a>`
        }
        this.value = 0;
        this.cdr.detectChanges();
      }
    }, error => {
      this.snackbar.open('No se pudo subir', 'OK', {duration: 2000});
    });
  }
}
