import { Component, OnInit, OnDestroy, Input } from '@angular/core';

// services
import { PresenceService } from 'src/chat21-core/providers/abstract/presence.service';

// utils
import { isInArray, setLastDateWithLabels } from 'src/chat21-core/utils/utils';

// Logger
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';

@Component({
  selector: 'app-user-presence',
  templateUrl: './user-presence.component.html',
  styleUrls: ['./user-presence.component.scss'],
})

export class UserPresenceComponent implements OnInit, OnDestroy {
  @Input() idUser: string;
  @Input() translationMap: Map<string, string>;
  @Input() fontColor: string;
  @Input() borderColor: string;


  public online = true;
  public status = '';
  private lastConnectionDate: string;
  private subscriptions = [];
  private logger: LoggerService = LoggerInstance.getInstance();

  constructor(
    public presenceService: PresenceService
  ) { }

  ngOnInit() {
    this.logger.log('[USER-PRESENCE-COMP] - ngOnInit');
    this.initialize();
  }


  /** */
  ngOnDestroy() {
    this.logger.log('[USER-PRESENCE-COMP] - ngOnDestroy');
    this.unsubescribeAll();
  }

  /** */
  initialize() {
    if (this.translationMap) {
      this.status = this.translationMap.get('LABEL_ACTIVE_NOW');
    }
    this.logger.log('[USER-PRESENCE-COMP] - initialize - this.translationMap', this.translationMap);
    this.logger.log('[USER-PRESENCE-COMP] - initialize - this.status', this.status);
    this.logger.log('[USER-PRESENCE-COMP] - initialize - idUser ->', this.idUser);
    this.setSubscriptions();
  }



  /** */
  private setSubscriptions() {
    this.presenceService.userIsOnline(this.idUser);
    this.presenceService.lastOnlineForUser(this.idUser);
    let subscribtionKey = '';
    let subscribtion: any;

    const that = this;

    subscribtionKey = 'BSIsOnline';
    subscribtion = this.subscriptions.find(item => item.key === subscribtionKey);
    if (!subscribtion) {
      subscribtion = this.presenceService.BSIsOnline.subscribe((data: any) => {
        this.logger.log('[USER-PRESENCE-COMP] $subs to BSIsOnline - data ', data);
        if (data) {
          const userId = data.uid;
          const isOnline = data.isOnline;
          if (this.idUser === userId) {
            that.userIsOnLine(userId, isOnline);
          }
        }
      });
      const subscribe = { key: subscribtionKey, value: subscribtion };
      this.subscriptions.push(subscribe);
    }


    subscribtionKey = 'BSLastOnline';
    subscribtion = this.subscriptions.find(item => item.key === subscribtionKey);
    if (!subscribtion) {
      subscribtion = this.presenceService.BSLastOnline.subscribe((data: any) => {
        this.logger.log('[USER-PRESENCE-COMP] $subs to BSLastOnline - data ', data);
        if (data) {
          const userId = data.uid;
          const timestamp = data.lastOnline;
          if (this.idUser === userId) {
            that.userLastConnection(userId, timestamp);
          }
        }
      });
      const subscribe = { key: subscribtionKey, value: subscribtion };
      this.subscriptions.push(subscribe);
    }


    // keySubscription = 'is-online-' + this.idUser;
    // if (!isInArray(keySubscription, this.subscriptions)) {
    //   this.subscriptions.push(keySubscription);
    //   this.events.subscribe(keySubscription, this.userIsOnLine);
    // }
    // keySubscription = 'last-connection-date-' + this.idUser;
    // if (!isInArray(keySubscription, this.subscriptions)) {
    //   this.subscriptions.push(keySubscription);
    //   this.events.subscribe(keySubscription, this.userLastConnection);
    // }
  }

  /**
   *
   */
  userIsOnLine = (userId: string, isOnline: boolean) => {
    this.logger.log('[USER-PRESENCE-COMP] userIsOnLine - userId: ', userId, ' - isOnline: ', isOnline);
    this.online = isOnline;
    if (isOnline) {
      this.status = this.translationMap.get('LABEL_ACTIVE_NOW');
    } else {
      this.status = this.translationMap.get('LABEL_NOT_AVAILABLE');
      if (this.lastConnectionDate && this.lastConnectionDate.trim() !== '') {
        this.status = this.lastConnectionDate;
      }
    }
  }

  /**
   *
   */
  userLastConnection = (userId: string, timestamp: string) => {
    this.logger.log('[USER-PRESENCE-COMP] userLastConnection - userId: ', userId, ' - timestamp: ', timestamp);
    if (timestamp && timestamp !== '') {
      const lastConnectionDate = setLastDateWithLabels(this.translationMap, timestamp);
      this.logger.log('[USER-PRESENCE-COMP] userLastConnection - lastConnectionDate', lastConnectionDate);
      this.lastConnectionDate = lastConnectionDate;
      if (this.online === false) {
        this.status = this.lastConnectionDate;
      }
    }
  }


  /** */
  private unsubescribeAll() {
    this.logger.log('[USER-PRESENCE-COMP] - unsubescribeAll: ', this.subscriptions);
    this.subscriptions.forEach(subscription => {
      subscription.value.unsubscribe(); // vedere come fare l'unsubscribe!!!!
    });
    this.subscriptions = [];
  }

}
