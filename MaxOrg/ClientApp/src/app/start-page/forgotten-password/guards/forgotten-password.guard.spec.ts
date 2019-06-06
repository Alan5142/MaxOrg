import {inject, TestBed} from '@angular/core/testing';

import {ForgottenPasswordGuard} from './forgotten-password.guard';

describe('ForgottenPasswordGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ForgottenPasswordGuard]
    });
  });

  it('should ...', inject([ForgottenPasswordGuard], (guard: ForgottenPasswordGuard) => {
    expect(guard).toBeTruthy();
  }));
});
