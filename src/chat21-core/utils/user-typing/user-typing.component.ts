import { Component, OnInit, OnDestroy, Input } from '@angular/core';

// services
import { TypingService } from '../../providers/abstract/typing.service';

// Logger
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';

@Component({
  selector: 'app-user-typing',
  templateUrl: './user-typing.component.html',
  styleUrls: ['./user-typing.component.scss'],
})
export class UserTypingComponent implements OnInit, OnDestroy {

  @Input() idConversation: string;
  @Input() idCurrentUser: string;
  @Input() isDirect: boolean;
  @Input() translationMap: Map<string, string>;
  @Input() color: string;
  @Input() membersConversation: [string];

  public status = '';
  public isTyping = false;
  public nameUserTypingNow: string;

  private setTimeoutWritingMessages: any;
  private subscriptions = [];

  private logger: LoggerService = LoggerInstance.getInstance();

  constructor(
    public typingService: TypingService
  ) { }

  /** */
  ngOnInit() {
    this.logger.log('[USER-TYPING-COMPONENT] - ngOnInit');
    this.initialize();
  }

  /** */
  ngOnDestroy() {
    this.logger.log('UserTypingComponent - ngOnDestroy');
    // this.unsubescribeAll();
  }

  /** */
  initialize() {
    this.status = ''; // this.translationMap.get('LABEL_AVAILABLE');
    this.logger.log('this.translationMap', this.translationMap);
    this.logger.log('this.status', this.status);
    this.setSubscriptions();
    this.typingService.isTyping(this.idConversation, this.idCurrentUser, this.isDirect);
  }

  /** */
  private setSubscriptions() {
    const that = this;
    const conversationSelected = this.subscriptions.find(item => item.key === this.idConversation);
    if (!conversationSelected) {
      const subscribeBSIsTyping =  this.typingService.BSIsTyping.subscribe((data: any) => {
        this.logger.log('***** BSIsTyping *****', data);
        if (data) {
          const isTypingUid = data.uid;
          if (this.idConversation === isTypingUid) {
            that.subscribeTypings(data);
          }
        }
      });
      const subscribe = {key: this.idConversation, value: subscribeBSIsTyping };
      this.subscriptions.push(subscribe);
    }
  }

  /** */
  subscribeTypings(data: any) {
    const that = this;
    try {
      const key = data.uidUserTypingNow;
      this.nameUserTypingNow = null;
      if (data.nameUserTypingNow) {
        this.nameUserTypingNow = data.nameUserTypingNow;
      }
      this.logger.log('subscribeTypings data:', data);
      const userTyping = this.membersConversation.includes(key);
      if ( !userTyping ) {
        this.isTyping = true;
        this.logger.log('child_changed key', key);
        this.logger.log('child_changed name', this.nameUserTypingNow);
        clearTimeout(this.setTimeoutWritingMessages);
        this.setTimeoutWritingMessages = setTimeout(() => {
            that.isTyping = false;
        }, 2000);
      }
    } catch (error) {
      this.logger.log('error: ', error);
    }
  }


  /** */
  private unsubescribeAll() {
    this.logger.log('UserTypingComponent unsubescribeAll: ', this.subscriptions);
    this.subscriptions.forEach((subscription: any) => {
      this.logger.log('unsubescribe: ', subscription);
      subscription.unsubescribe();
    });
    this.subscriptions = [];
  }


}
