import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {NewDerivedProjectComponent} from './new-derived-project.component';

describe('NewDerivedProjectComponent', () => {
  let component: NewDerivedProjectComponent;
  let fixture: ComponentFixture<NewDerivedProjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewDerivedProjectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewDerivedProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
