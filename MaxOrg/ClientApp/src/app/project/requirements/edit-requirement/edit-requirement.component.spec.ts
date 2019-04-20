import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRequirementComponent } from './edit-requirement.component';

describe('EditRequirementComponent', () => {
  let component: EditRequirementComponent;
  let fixture: ComponentFixture<EditRequirementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditRequirementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditRequirementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
