import { TestBed } from '@angular/core/testing';

import { ContactsDirectoryService } from './contacts-directory.service';

describe('ContactsDirectoryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ContactsDirectoryService = TestBed.get(ContactsDirectoryService);
    expect(service).toBeTruthy();
  });
});
