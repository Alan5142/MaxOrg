import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";

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
    public dialogRef: MatDialogRef<GroupCardComponent>,
    private sanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    marked.setOptions({
      renderer: new marked.Renderer(),
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
    const html = marked(data.group.description);
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
        'img'
      ],
      allowedAttributes: {
        'a': ['href', 'target', 'rel'],
        'img': ['src'],
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

  }


  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
  }
}
