import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {KanbanToolbarComponent} from './kanban-toolbar.component';

describe('KanbanToolbarComponent', () => {
  let component: KanbanToolbarComponent;
  let fixture: ComponentFixture<KanbanToolbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [KanbanToolbarComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KanbanToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
