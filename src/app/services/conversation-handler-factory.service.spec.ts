import { TestBed } from '@angular/core/testing';

import { ConversationHandlerFactoryService } from './conversation-handler-factory.service';

describe('ConversationHandlerFactoryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ConversationHandlerFactoryService = TestBed.get(ConversationHandlerFactoryService);
    expect(service).toBeTruthy();
  });
});
