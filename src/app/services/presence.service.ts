import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export abstract class PresenceService {

  abstract initialize(tenant: string): void;

  abstract userIsOnline(userid: string): void;

  abstract lastOnlineForUser(userid: string): void;
}
