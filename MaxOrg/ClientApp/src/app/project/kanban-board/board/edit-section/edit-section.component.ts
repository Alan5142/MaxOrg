import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {DialogData} from '../../../../start-page/navbar/navbar.component';
import {KanbanGroup} from '../../../../services/kanban-cards.service';

@Component({
  selector: 'app-edit-section',
  templateUrl: './edit-section.component.html',
  styleUrls: ['./edit-section.component.scss']
})
export class EditSectionComponent implements OnInit {
  group: KanbanGroup;
  constructor(public dialogRef: MatDialogRef<EditSectionComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData) {
    this.group = (data as any);
  }

  ngOnInit() {
  }

}
