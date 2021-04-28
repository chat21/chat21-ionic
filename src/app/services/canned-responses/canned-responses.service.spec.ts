import { TestBed } from '@angular/core/testing';

import { CannedResponsesService } from './canned-responses.service';

describe('CannedResponsesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CannedResponsesService = TestBed.get(CannedResponsesService);
    expect(service).toBeTruthy();
  });
});
