
import { Injectable } from '@angular/core';
// services
import { NotificationsService } from '../abstract/notifications.service';

@Injectable({
    providedIn: 'root'
  })
  export class MQTTNotifications extends NotificationsService {
    public tenant: string;
    public BUILD_VERSION: string;
    constructor( ) {
        super();
    }

    
    getNotificationPermissionAndSaveToken(currentUser: string) { 


    }


    removeNotificationsInstance(callback: (string) => void) {
        
    }
      
  }
