import { Injectable } from '@angular/core';
import { UserModel } from 'src/chat21-core/models/user';
import * as PACKAGE from '../../../../package.json';

@Injectable({
  providedIn: 'root'
})
export abstract class NotificationsService {
  
  private _tenant: string;
  public BUILD_VERSION = PACKAGE.version

  public setTenant(tenant): void {
    this._tenant = tenant;
  }
  public getTenant(): string {
    if (this._tenant) {
      return this._tenant;
    } 
  }

  abstract initialize(tenant: string, vapidKey: string): void;
  abstract getNotificationPermissionAndSaveToken(currentUserUid: string): void;
  abstract removeNotificationsInstance(callback: (string) => void): void;

  constructor( ) { 
      
  }


}
