import { TestBed } from '@angular/core/testing';

import { TiledeskService } from './tiledesk.service';

describe('TiledeskService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TiledeskService = TestBed.get(TiledeskService);
    expect(service).toBeTruthy();
  });
});
