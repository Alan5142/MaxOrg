import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {KanbanIndexComponent} from './kanban-index.component';

describe('KanbanIndexComponent', () => {
  let component: KanbanIndexComponent;
  let fixture: ComponentFixture<KanbanIndexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [KanbanIndexComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KanbanIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
