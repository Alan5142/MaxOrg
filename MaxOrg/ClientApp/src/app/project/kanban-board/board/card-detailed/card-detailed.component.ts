import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material";
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import * as marked from 'marked/marked.min';
import * as sanitizeHtml from 'sanitize-html/dist/sanitize-html';
import {HighlightService} from "../../../../services/highlight.service";
import {CardDeleteComponent} from "../card-delete/card-delete.component";

@Component({
  selector: 'app-card-detailed',
  templateUrl: './card-detailed.component.html',
  styleUrls: ['./card-detailed.component.scss']
})
export class CardDetailedComponent implements OnInit {

  detailedDescription: ElementRef = null;
  description: SafeHtml = null;

  @ViewChild('detailedDescription') set content(content: ElementRef) {
    this.detailedDescription = content;
    if (this.detailedDescription !== null && this.detailedDescription !== undefined) {
      setTimeout(() => this.detailedDescription.nativeElement.focus(), 0);
    }
  }

  public isEditing = false;

  constructor(public dialogRef: MatDialogRef<CardDetailedComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private highlighter: HighlightService,
              private dialog: MatDialog,
              private sanitizer: DomSanitizer,) {
  }

  ngOnInit() {
    setTimeout(() => this.parseMarkdown(), 0);
  }

  parseMarkdown() {
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

    const html = marked(this.data.task.detailedDescription);
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
        'code'
      ],
      allowedAttributes: {
        'a': ['href', 'target', 'rel'],
        'img': ['src'],
        'span': ['class'],
        'code': ['class'],
        'pre': ['class', 'data-start', '*'],
        '*': ['href', 'align', 'alt', 'center', 'bgcolor', 'style']
      },
      transformTags: {
        'a': (tagName, attribs) => {
          // Always open links in a new window
          if (attribs) {
            attribs.target = '_blank';
            attribs.rel = 'noopener noreferrer';
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
        }
      },
      allowedStyles: {
        '*': {
          // Match HEX and RGB
          'color': [/^\#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/],
          'text-align': [/^left$/, /^right$/, /^center$/],
          // Match any number with px, em, or %
          'font-size': [/^\d+(?:px|em|%)$/]
        },
        'img': {
          'width': [/^\d+(?:px|em|%)$/],
          'height': [/^\d+(?:px|em|%)$/]
        }
      }
    });
    this.description = this.sanitizer.bypassSecurityTrustHtml(cleanHtml);
    setTimeout(() => this.highlighter.highlightAll(), 0);
  }

  updateMarkdown() {
    if (!this.isEditing) {
      this.parseMarkdown();
    }
  }

  deleteToDoTask() {
    const dialog = this.dialog.open(CardDeleteComponent, {data: {id: this.data.task.id}});
    dialog.afterClosed().subscribe(shouldClose => {
      if (shouldClose !== undefined) {
        this.dialogRef.close({shouldDelete: true});
      }
    });
  }
}
