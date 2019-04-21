import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoveRequirementComponent } from './remove-requirement.component';

describe('RemoveRequirementComponent', () => {
  let component: RemoveRequirementComponent;
  let fixture: ComponentFixture<RemoveRequirementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RemoveRequirementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RemoveRequirementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
