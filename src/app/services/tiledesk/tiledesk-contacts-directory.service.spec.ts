import { TestBed } from '@angular/core/testing';

import { TiledeskContactsDirectoryService } from './tiledesk-contacts-directory.service';

describe('TiledeskContactsDirectoryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TiledeskContactsDirectoryService = TestBed.get(TiledeskContactsDirectoryService);
    expect(service).toBeTruthy();
  });
});
