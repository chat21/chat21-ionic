import { ImageRepoService } from 'src/chat21-core/providers/abstract/image-repo.service';
import { Component, OnInit, Input, EventEmitter, Output, ViewChild, Renderer2 } from '@angular/core';
import { ModalController } from '@ionic/angular';

// services
import { NavProxyService } from '../../services/nav-proxy.service';
import { ChatManager } from 'src/chat21-core/providers/chat-manager';
import { CustomTranslateService } from 'src/chat21-core/providers/custom-translate.service';
import { PresenceService } from 'src/chat21-core/providers/abstract/presence.service';
// import { EventsService } from '../../services/events-service';
import { AuthService } from 'src/chat21-core/providers/abstract/auth.service';

// models
import { UserModel } from 'src/chat21-core/models/user';

// utils
import { isInArray, setLastDateWithLabels } from 'src/chat21-core/utils/utils';
import * as PACKAGE from 'package.json';
import { EventsService } from 'src/app/services/events-service';


@Component({
  selector: 'app-profile-info',
  templateUrl: './profile-info.page.html',
  styleUrls: ['./profile-info.page.scss'],
})
export class ProfileInfoPage implements OnInit {
  @ViewChild('useruidTooltip', { static: false }) useruidTooltip: any;

  loggedUser: UserModel;
  version: string;
  itemAvatar: any;
  public translationMap: Map<string, string>;


  private subscriptions = [];
  borderColor = '#2d323e';
  fontColor = '#949494';
  tooltip: HTMLElement;
  tooltipOptions = {
    'show-delay': 100,
    'tooltip-class': 'chat-tooltip',
    'theme': 'light',
    'shadow': false,
    'hide-delay-mobile': 0,
    'hideDelayAfterClick': 3000,
    'hide-delay': 200
  };

  constructor(
    private modalController: ModalController,
    private navService: NavProxyService,
    private chatManager: ChatManager,
    private translateService: CustomTranslateService,
    public presenceService: PresenceService,
    public events: EventsService,
    private authService: AuthService,
    private imageRepo: ImageRepoService,
    public renderer: Renderer2
  ) { }

  /** */
  ngOnInit() {
    this.version = PACKAGE.version;
    this.translations();
  }

  /** */
  ionViewDidEnter() {
    this.initialize();
  }

  /** */
  ionViewWillLeave() {
    this.unsubescribeAll();
  }

  /** */
  initialize() {
    this.setUser();
    this.setSubscriptions();
  }

  /** */
  private setUser() {
    // width and height NON sono obbligatori
    this.loggedUser = this.chatManager.getCurrentUser();
    this.itemAvatar = {
      imageurl: this.imageRepo.getImagePhotoUrl(this.loggedUser.uid),
      avatar: this.loggedUser.avatar,
      color: this.loggedUser.color,
      online: this.loggedUser.online,
      lastConnection: this.loggedUser.lastConnection,
      status: '',
      width: '100px',
      height: '100px'
    };
  }


  /** */
  public translations() {
    const keys = [
      'LABEL_AVAILABLE',
      'LABEL_NOT_AVAILABLE',
      'LABEL_TODAY',
      'LABEL_TOMORROW',
      'LABEL_TO',
      'LABEL_LAST_ACCESS',
      'ARRAY_DAYS',
      'LABEL_ACTIVE_NOW',
      'LABEL_IS_WRITING',
      'LABEL_LOGOUT'
    ];
    this.translationMap = this.translateService.translateLanguage(keys);
  }


  /** */
  private setSubscriptions() {
    this.presenceService.userIsOnline(this.loggedUser.uid);
    this.presenceService.lastOnlineForUser(this.loggedUser.uid);
    let keySubscription = '';
    // keySubscription = 'is-online-' + this.loggedUser.uid;
    // if (!isInArray(keySubscription, this.subscriptions)) {
    //   this.subscriptions.push(keySubscription);
    //   this.events.subscribe(keySubscription, this.userIsOnLine);
    // }
    // keySubscription = 'last-connection-date-' + this.loggedUser.uid;
    // if (!isInArray(keySubscription, this.subscriptions)) {
    //   this.subscriptions.push(keySubscription);
    //   this.events.subscribe(keySubscription, this.userLastConnection);
    // }


    const that = this;
    const subscribeBSIsOnline = this.presenceService.BSIsOnline.subscribe((data: any) => {
      console.log('***** BSIsOnline *****', data);
      if (data) {
        const userId = data.uid;
        const isOnline = data.isOnline;
        if (this.loggedUser.uid === userId) {
          that.userIsOnLine(userId, isOnline);
        }
      }
    });

    const subscribeBSLastOnline = this.presenceService.BSLastOnline.subscribe((data: any) => {
      console.log('***** BSLastOnline *****', data);
      if (data) {
        const userId = data.uid;
        const timestamp = data.lastOnline;
        if (this.loggedUser.uid === userId) {
          that.userLastConnection(userId, timestamp);
        }
      }
    });


  }

  /**
   *
   */
  userIsOnLine = (userId: string, isOnline: boolean) => {
    console.log('************** userIsOnLine', userId, isOnline);
    this.itemAvatar.online = isOnline;
    if (isOnline) {
      this.itemAvatar.status = this.translationMap.get('LABEL_AVAILABLE');
    } else {
      this.itemAvatar.status = this.translationMap.get('LABEL_NOT_AVAILABLE');
    }
  }

  /**
   *
   */
  userLastConnection = (userId: string, timestamp: string) => {
    console.log('************** userLastConnection', userId, timestamp);
    if (timestamp && timestamp !== '') {
      const lastConnectionDate = setLastDateWithLabels(this.translationMap, timestamp);
      this.itemAvatar.lastConnection = lastConnectionDate;
      if (!this.itemAvatar.online) {
        this.itemAvatar.status = lastConnectionDate;
      }
    }
  }

  onClickArchivedConversation() {
    this.onClose().then(() => {
      this.events.publish('profileInfoButtonClick:changed', 'displayArchived');
    })
  }


  /** */
  private unsubescribeAll() {
    console.log('unsubescribeAll: ', this.subscriptions);
    this.subscriptions.forEach((subscription: any) => {
      console.log('unsubescribe: ', subscription);
      // this.events.unsubscribe(subscription, null);
    });
    this.subscriptions = [];
  }

  /** */
  async onClose() {
    const isModalOpened = await this.modalController.getTop();
    if (isModalOpened) {
      this.modalController.dismiss({ confirmed: true });
    } else {
      this.navService.pop();
    }
  }

  /** */
  public onLogout() {
    // this.authService.logout();
    this.onClose()
    // pubblico evento
    this.events.publish('profileInfoButtonClick:logout', true);
  }

  copyLoggedUserUID() {
    var copyText = document.createElement("input");                  
    copyText.setAttribute("type", "text");
    copyText.setAttribute("value", this.loggedUser.uid);
     
    document.body.appendChild(copyText); 
    copyText.select();
    copyText.setSelectionRange(0, 99999); /*For mobile devices*/
    document.execCommand("copy");
    console.log("Copied the text: " + copyText.value);
    const tootipElem = <HTMLElement>document.querySelector('.chat-tooltip');
    this.renderer.appendChild(tootipElem, this.renderer.createText('Copied!'))

  }
}
