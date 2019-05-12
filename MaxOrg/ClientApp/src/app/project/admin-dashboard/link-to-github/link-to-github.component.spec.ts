import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkToGithubComponent } from './link-to-github.component';

describe('LinkToGithubComponent', () => {
  let component: LinkToGithubComponent;
  let fixture: ComponentFixture<LinkToGithubComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LinkToGithubComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkToGithubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
