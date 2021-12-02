
import { Injectable } from '@angular/core';
// services
import { NotificationsService } from '../abstract/notifications.service';
import { LoggerInstance } from '../logger/loggerInstance';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
// firebase
import firebase from "firebase/app";
import 'firebase/messaging';
import 'firebase/auth';
// chat21
import { Chat21Service } from './chat-service';

@Injectable({
    providedIn: 'root'
  })
  export class MQTTNotifications extends NotificationsService {
    
    public BUILD_VERSION: string;
    private FCMcurrentToken: string;
    private userId: string;
    private tenant: string;
    private vapidkey: string;
    private logger: LoggerService = LoggerInstance.getInstance();

    constructor(
      public chat21Service: Chat21Service
  ) {
      super();
  }

    initialize(tenant: string, vapId: string): void {
      this.tenant = tenant;
      this.vapidkey = vapId;
      return;
    }
    
    getNotificationPermissionAndSaveToken(currentUserUid) {
      console.log("getNotificationPermissionAndSaveToken()",currentUserUid );
      this.userId = currentUserUid;
      if (firebase.messaging.isSupported()) {
        console.log("firebase.messaging.isSupported() YES");
          const messaging = firebase.messaging();
          // messaging.requestPermission()
          Notification.requestPermission().then((permission) => {
              if (permission === 'granted') {
                  this.logger.log('[MQTT-FIREBASE-NOTIFICATIONS] >>>> requestPermission Notification permission granted.');

                  return messaging.getToken({ vapidKey: this.vapidkey })
              }
          }).then(FCMtoken => {
              this.logger.log('[MQTT-FIREBASE-NOTIFICATIONS] >>>> requestPermission FCMtoken', FCMtoken)
              // Save FCM Token in Chat21
              this.FCMcurrentToken = FCMtoken;
              this.saveToken(FCMtoken, currentUserUid)
          }).catch((err) => {
              this.logger.error('[FIREBASE-NOTIFICATIONS] >>>> requestPermission ERR: Unable to get permission to notify.', err);
          });
      } else {
          this.logger.log('[FIREBASE-NOTIFICATIONS] >>>> FIREBASE MESSAGING IS NOT SUPPORTED')
      }
    }


    removeNotificationsInstance(callback: (string) => void) {
      var self = this;
        // firebase.auth().onAuthStateChanged(function (user) {
        //     if (user) {
        //         self.logger.debug('[FIREBASE-NOTIFICATIONS] - FB User is signed in. ', user)
        //         self.logger.log('[FIREBASE-NOTIFICATIONS] >>>> removeNotificationsInstance > this.userId', self.userId);
        //         self.logger.log('[FIREBASE-NOTIFICATIONS] >>>> removeNotificationsInstance > FCMcurrentToken', self.FCMcurrentToken);
        //         // this.logger.log('[FIREBASE-NOTIFICATIONS] >>>> removeNotificationsInstance > this.tenant', this.tenant);
        //     } else {
        //         self.logger.debug('[FIREBASE-NOTIFICATIONS] - No FB user is signed in. ', user)
        //     }
        // });
        const urlNodeFirebase = '/apps/' + self.tenant
        const connectionsRefinstancesId = urlNodeFirebase + '/users/' + self.userId + '/instances/'
        self.logger.log('[FIREBASE-NOTIFICATIONS] >>>> connectionsRefinstancesId ', connectionsRefinstancesId);
        let connectionsRefURL = '';
        if (connectionsRefinstancesId) {
            connectionsRefURL = connectionsRefinstancesId + self.FCMcurrentToken;
            const connectionsRef = firebase.database().ref().child(connectionsRefURL);
            self.logger.log('[FIREBASE-NOTIFICATIONS] >>>> connectionsRef ', connectionsRef);
            self.logger.log('[FIREBASE-NOTIFICATIONS] >>>> connectionsRef url ', connectionsRefURL);
            connectionsRef.off()
            connectionsRef.remove()
                .then(() => {
                    self.logger.log("[FIREBASE-NOTIFICATIONS] >>>> removeNotificationsInstance > Remove succeeded.")
                    callback('success')
                }).catch((error) => {
                    self.logger.error("[FIREBASE-NOTIFICATIONS] >>>> removeNotificationsInstance Remove failed: " + error.message)
                    callback('error')
                }).finally(() => {
                    self.logger.log('[FIREBASE-NOTIFICATIONS] COMPLETED');
                })
        }
    }
    
    private saveToken(FCMcurrentToken, currentUserUid) {
      this.logger.log('[FIREBASE-NOTIFICATIONS] >>>> getPermission > updateToken ', FCMcurrentToken);
      if (!currentUserUid || !FCMcurrentToken) {
          return
      };
      const device_model = {
          device_model: navigator.userAgent,
          language: navigator.language,
          platform: 'ionic',
          platform_version: this.BUILD_VERSION
      }
      this.chat21Service.chatClient.saveInstance(
        FCMcurrentToken,
        device_model,
        (err, response) => {
          if (err) {
            this.logger.error('Error saving FCMcurrentToken on chat21 App Instance', FCMcurrentToken);
          }
        }
      );
    }

  }
