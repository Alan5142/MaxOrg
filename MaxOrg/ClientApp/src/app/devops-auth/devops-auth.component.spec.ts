import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {DevopsAuthComponent} from './devops-auth.component';

describe('DevopsAuthComponent', () => {
  let component: DevopsAuthComponent;
  let fixture: ComponentFixture<DevopsAuthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DevopsAuthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevopsAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
