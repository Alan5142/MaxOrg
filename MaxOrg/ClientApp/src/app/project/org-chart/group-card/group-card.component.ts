import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {ChangeDescriptionComponent} from '../../admin-dashboard/change-description/change-description.component';
import {HighlightService} from 'src/app/services/highlight.service';

declare var require: any;

const marked = require('marked/marked.min');
const sanitizeHtml = require('sanitize-html/dist/sanitize-html');

@Component({
  selector: 'app-group-card',
  templateUrl: './group-card.component.html',
  styleUrls: ['./group-card.component.scss']
})
export class GroupCardComponent implements OnInit {

  description: SafeHtml = null;
  constructor(
    private dialog:MatDialog,
    public dialogRef: MatDialogRef<GroupCardComponent>,
    private sanitizer: DomSanitizer,
    private highlighter: HighlightService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.setDescription(data.group.description);
  }
  setDescription(description){
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
    {
        const html = marked(description);
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
        this.description = this.sanitizer.bypassSecurityTrustHtml(cleanHtml);
        setInterval(() => this.highlighter.highlightAll(), 0);
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
  changeDescription(){
    let dialogRef=this.dialog.open(ChangeDescriptionComponent,{
      data:{groupId:this.data.group.id}
    });
    dialogRef.afterClosed().subscribe(newDescription=>{
      if(newDescription){
        this.setDescription(newDescription);
        this.data.group.description=newDescription;
      }
    });
  }

  ngOnInit() {
  }
}
