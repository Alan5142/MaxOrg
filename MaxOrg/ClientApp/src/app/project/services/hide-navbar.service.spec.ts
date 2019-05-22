import {TestBed} from '@angular/core/testing';

import {HideNavbarService} from './hide-navbar.service';

describe('HideNavbarService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HideNavbarService = TestBed.get(HideNavbarService);
    expect(service).toBeTruthy();
  });
});
