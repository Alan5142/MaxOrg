import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignedWorkComponent } from './assigned-work.component';

describe('AssignedWorkComponent', () => {
  let component: AssignedWorkComponent;
  let fixture: ComponentFixture<AssignedWorkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignedWorkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignedWorkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
