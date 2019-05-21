import {AfterViewChecked, Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {GroupsService} from '../../services/groups.service';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {HighlightService} from '../../services/highlight.service';
import * as marked from 'marked/marked.min';
import * as sanitizeHtml from 'sanitize-html/dist/sanitize-html';

@Component({
  selector: 'app-description',
  templateUrl: './description.component.html',
  styleUrls: ['./description.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DescriptionComponent implements OnInit, AfterViewChecked {
  description: SafeHtml = null;
  @ViewChild('descriptionContainer') descriptionContainer: HTMLElement;
  shouldHighlight = false;

  constructor(public route: ActivatedRoute,
              public group: GroupsService,
              private sanitizer: DomSanitizer,
              private highlighter: HighlightService) {
  }

  ngOnInit() {
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
    this.route.parent.params.subscribe(params => {
      this.group.getGroupDescription(params['id']).subscribe(description => {
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
        this.shouldHighlight = true;
      });
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldHighlight) {
      this.shouldHighlight = false;
      this.highlighter.highlightAll()
    }

  }
}
