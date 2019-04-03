import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewSubgroupComponent } from './new-subgroup.component';

describe('NewSubgroupComponent', () => {
  let component: NewSubgroupComponent;
  let fixture: ComponentFixture<NewSubgroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewSubgroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewSubgroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
