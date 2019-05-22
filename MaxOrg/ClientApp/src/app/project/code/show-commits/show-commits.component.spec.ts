import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowCommitsComponent } from './show-commits.component';

describe('ShowCommitsComponent', () => {
  let component: ShowCommitsComponent;
  let fixture: ComponentFixture<ShowCommitsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowCommitsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowCommitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
