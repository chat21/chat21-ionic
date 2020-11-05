import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export abstract class PresenceService {

  // params
  abstract tenant = environment.tenant;

  // functions
  abstract initialize(): void;
  abstract userIsOnline(userid: string): void;
  abstract lastOnlineForUser(userid: string): void;
}
