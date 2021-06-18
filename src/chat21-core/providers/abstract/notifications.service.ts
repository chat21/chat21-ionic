import { Injectable } from '@angular/core';
import { UserModel } from 'src/chat21-core/models/user';
import * as PACKAGE from '../../../../package.json';

@Injectable({
  providedIn: 'root'
})
export abstract class NotificationsService {
  public tenant: string;

  public setTenant(tenant): void {
    console.log('FIREBASE-NOTIFICATIONS (SERVICE) tenant ',  this.tenant)
    this.tenant = tenant;
  }

  public getTenant(): string {
    if (this.tenant) {
      return this.tenant;
    } 
  }

  abstract BUILD_VERSION = PACKAGE.version
  // abstract initMessaging(): void;

  
  abstract getNotificationPermissionAndSaveToken(currentUserUid: string): void;

  abstract removeNotificationsInstance(callback: (string) => void): void;

  constructor( ) { 
      
  }


}
