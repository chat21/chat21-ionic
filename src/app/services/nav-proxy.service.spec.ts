import { TestBed } from '@angular/core/testing';

import { NavProxyService } from './nav-proxy.service';

describe('NavProxyService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NavProxyService = TestBed.get(NavProxyService);
    expect(service).toBeTruthy();
  });
});
