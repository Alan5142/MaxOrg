import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowIssuesComponent } from './show-issues.component';

describe('ShowIssuesComponent', () => {
  let component: ShowIssuesComponent;
  let fixture: ComponentFixture<ShowIssuesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowIssuesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowIssuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
