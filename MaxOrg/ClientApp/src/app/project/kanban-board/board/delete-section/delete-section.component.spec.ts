import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteSectionComponent } from './delete-section.component';

describe('DeleteSectionComponent', () => {
  let component: DeleteSectionComponent;
  let fixture: ComponentFixture<DeleteSectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeleteSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
