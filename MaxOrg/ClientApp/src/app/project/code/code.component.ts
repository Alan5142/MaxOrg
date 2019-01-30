import {Component, OnInit} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {MatIconRegistry} from '@angular/material';

@Component({
  selector: 'app-code',
  templateUrl: './code.component.html',
  styleUrls: ['./code.component.scss']
})
export class CodeComponent implements OnInit {

  items = [
    {isFolder: true, name: 'folder example'},
    {isFolder: true, name: 'folder example 2'},
    {isFolder: false, name: 'hello world.py'},
    {isFolder: false, name: 'hello world 2.kt'}
    ];

  constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon(
      'file',
      sanitizer.bypassSecurityTrustResourceUrl('/icons/file_icon.svg'));
  }

  ngOnInit() {
  }

}
