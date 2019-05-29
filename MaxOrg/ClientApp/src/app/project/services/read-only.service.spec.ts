import {TestBed} from '@angular/core/testing';

import {ReadOnlyService} from './read-only.service';

describe('ReadOnlyService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ReadOnlyService = TestBed.get(ReadOnlyService);
    expect(service).toBeTruthy();
  });
});
