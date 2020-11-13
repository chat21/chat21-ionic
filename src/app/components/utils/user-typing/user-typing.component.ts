import { Component, OnInit, OnDestroy, Input } from '@angular/core';

// services
import { TypingService } from 'src/app/services/typing.service';
import { EventsService } from 'src/app/services/events-service';

// utils
import { isInArray } from 'src/app/utils/utils';

@Component({
  selector: 'app-user-typing',
  templateUrl: './user-typing.component.html',
  styleUrls: ['./user-typing.component.scss'],
})
export class UserTypingComponent implements OnInit, OnDestroy {

  @Input() idConversation: string;
  @Input() idUser: string;
  @Input() translationMap: Map<string, string>;
  @Input() color: string;
  @Input() membersConversation: [string];

  public status = '';
  private subscriptions = [];
  public isTyping = false;
  public nameUserTypingNow: string;

  private setTimeoutWritingMessages: any;

  constructor(
    public typingService: TypingService,
    public events: EventsService
  ) { }

  ngOnInit() {
    this.initialize();
  }

  /** */
  ngOnDestroy() {
    console.log('UserPresenceComponent - ngOnDestroy');
    this.unsubescribeAll();
  }

  /** */
  initialize() {
    this.status = ''; // this.translationMap.get('LABEL_AVAILABLE');
    console.log('this.translationMap', this.translationMap);
    console.log('this.status', this.status);
    this.setSubscriptions();
    this.typingService.isTyping(this.idConversation, this.idUser);
  }


   /** */
  private unsubescribeAll() {
    console.log('unsubescribeAll: ', this.subscriptions);
    this.subscriptions.forEach((subscription: any) => {
      console.log('unsubescribe: ', subscription);
      this.events.unsubscribe(subscription, null);
    });
    this.subscriptions = [];
  }

  /** */
  private setSubscriptions() {
    const key = 'isTyping';
    if (!isInArray(key, this.subscriptions)) {
      this.subscriptions.push(key);
      this.events.subscribe(key, this.subscribeTypings);
    }
  }

  /**
   */
  subscribeTypings = (childSnapshot: any) => {
    const that = this;
    console.log('subscribeTypings childSnapshot', childSnapshot);
    const userTyping = this.membersConversation.includes(childSnapshot.key);
    if ( !userTyping ) {
      this.isTyping = true;
      this.nameUserTypingNow = childSnapshot.name;
      console.log('child_changed key', childSnapshot.key);
      console.log('child_changed val', childSnapshot.val());
      console.log('child_changed name', childSnapshot.name);
      clearTimeout(this.setTimeoutWritingMessages);
      this.setTimeoutWritingMessages = setTimeout(() => {
          that.isTyping = false;
      }, 2000);
    }
  }


}
