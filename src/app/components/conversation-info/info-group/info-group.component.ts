import { TiledeskAuthService } from './../../../../chat21-core/providers/tiledesk/tiledesk-auth.service';
import { Component, OnInit, AfterViewInit, Input, OnChanges, Renderer2, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { ImageRepoService } from 'src/chat21-core/providers/abstract/image-repo.service';
import { PresenceService } from 'src/chat21-core/providers/abstract/presence.service';
import { ContactsService } from 'src/app/services/contacts/contacts.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { filter } from 'rxjs/operators';

// Logger
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Location, LocationStrategy, PathLocationStrategy, PopStateEvent } from '@angular/common';

// import {avatarPlaceholder, getColorBck} from 'src/chat21-core/utils/utils-user';
@Component({
  selector: 'app-info-group',
  templateUrl: './info-group.component.html',
  styleUrls: ['./info-group.component.scss'],
})
export class InfoGroupComponent implements OnInit, AfterViewInit, OnChanges {
  // objectKeys = Object.keys;

  @Input() groupDetail: any;
  // @Input() member_array: any;
  public displaySkeletonScreen: boolean = true;
  public member_array: any
  private unsubscribe$: Subject<any> = new Subject<any>();


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

  private logger: LoggerService = LoggerInstance.getInstance();
  route: string;
  previousUrl: string;
  membersObjectLength: number;
  // @Output() pleaseDeleteMeEvent = new EventEmitter();
  constructor(
    public imageRepoService: ImageRepoService,
    public presenceService: PresenceService,
    public tiledeskAuthService: TiledeskAuthService,
    public contactsService: ContactsService,
    public renderer: Renderer2,
    private router: Router,
    public location: Location,
  ) {

    this.logger.log('InfoGroupComponent >>> constructor HELLO !!!');
    // this.router.events.subscribe((val) => {
    //   if (this.location.path() !== '') {
    //     this.route = this.location.path();
    //      this.logger.log('InfoGroupComponent - route ', this.route);
    //   }
    // })

    // const currentUrl = this.router.url;
    // this.logger.log('InfoGroupComponent current_url ', currentUrl);
    // .pipe(takeUntil(this.unsubscribe$))
    router.events
      .pipe(filter(event => event instanceof NavigationEnd))

      .subscribe((event: NavigationEnd) => {
        // console.log('InfoGroupComponent -  router.events prev url :', event.url);
        this.previousUrl = event.url;


        this.unsubscribe$.next();
        this.unsubscribe$.complete();
        this.member_array = []
        console.log('InfoGroupComponent -  router.events member_array :', this.member_array);
        // this.pleaseDeleteMeEvent.emit();

        if (this.groupDetail.hasOwnProperty("member_array")) {
          // console.log('InfoGroupComponent - router.events has Property member_array  :', this.groupDetail.hasOwnProperty("member_array"));
          delete this.groupDetail['member_array'];
        }
      });

    // if (currentUrl !==  this.previousUrl) {

    // }
  }


  ngOnInit() {
    this.logger.log(' InfoGroupComponent - ngOnInit');
  }

  ngAfterViewInit() {
    this.logger.log('InfoGroupComponent - ngAfterViewInit ');
    // this.logger.log('InfoGroupComponent conversationWith', this.conversationWith);
  }

  ngOnDestroy() {
    // this.logger.log('ngOnDestroy ConversationDetailPage: ');
    this.logger.log('InfoGroupComponent >  ngOnDestroy');
    this.displaySkeletonScreen = true

  }

  public generateFake(count: number): Array<number> {
    const indexes = [];
    for (let i = 0; i < count; i++) {
      indexes.push(i);
    }
    return indexes;
  }


  ngOnChanges() {
    this.displaySkeletonScreen = true
    this.logger.log('InfoGroupComponent >>> ngOnChanges member_array', this.member_array);
    // this.displaySkeletonScreen = true
    this.logger.log('InfoGroupComponent ngOnChanges displaySkeletonScreen', this.displaySkeletonScreen);

    this.logger.log('InfoGroupComponent ngOnChanges groupDetail', this.groupDetail);
    this.membersObjectLength = null
    if (this.groupDetail) {
      this.membersObjectLength = Object.keys(this.groupDetail.members).length;
      this.logger.log('InfoGroupComponent ngOnChanges groupDetail membersObjectLength', this.membersObjectLength);
    }

    if (this.groupDetail) {
      if (this.groupDetail.uid.startsWith('group-')) {
        const tiledeskToken = this.tiledeskAuthService.getTiledeskToken();

        this.member_array = []
        const members_isonline_array = []

        for (const [key, value] of Object.entries(this.groupDetail.members)) {
          this.logger.log('CONVERSATION-DETAIL group detail Key:', key, ' -Value: ', value);
          members_isonline_array[key] = {};
          members_isonline_array[key]['isSignin'] = false
        }

        // for (const [key, value] of Object.entries(this.groupDetail.membersinfo)) {
        let count = 0
        for (const [key, value] of Object.entries(this.groupDetail.members)) {
          this.logger.log('CONVERSATION-DETAIL group detail Key:', key, ' -Value: ', value);

          this.presenceService.userIsOnline(key)
            .pipe(takeUntil(this.unsubscribe$))
            .pipe(filter((isOnline) => isOnline !== null))
            .subscribe((isOnline: any) => {
              this.logger.log('InfoGroupComponent group detail BSIsOnline isOnline', isOnline)
              members_isonline_array[key]['isSignin'] = isOnline.isOnline
              if (this.member_array.length > 0) {
                this.logger.log('InfoGroupComponent group detail BSIsOnline HERE YES')
                // this.member_array.find(x => x.userid == isOnline.uid)['userOnline'] = isOnline.isOnline


              }
              this.logger.log('InfoGroupComponent group detail BSIsOnline  this.groupDetail 2', this.groupDetail)
              this.logger.log('InfoGroupComponent group detail BSIsOnline isOnline member_array', this.member_array)
            }, (error) => {
              this.logger.error('InfoGroupComponent group detail BSIsOnline - ERROR  ', error);
            }, () => {
              this.logger.log('InfoGroupComponent group detail BSIsOnline /* COMPLETE */');

            });

          this.contactsService.loadContactDetail(tiledeskToken, key)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(user => {
              this.logger.log('InfoGroupComponent group detail loadContactDetail RES', user);
              // this.logger.log('InfoGroupComponent group detail this.presenceService.BSIsOnline.value()', this.presenceService.BSIsOnline.getValue);

              user.imageurl = this.imageRepoService.getImagePhotoUrl(key)
              // this.member_array.push({ userid: user.uid, avatar: user.avatar, color: user.color, email: user.email, fullname: user.fullname, imageurl: user.imageurl, userOnline: isOnline })
              var index = this.member_array.findIndex(m => m.userid === user.uid);
              this.logger.log('InfoGroupComponent member_array first of push index', index);
              this.logger.log('InfoGroupComponent member_array first of push', this.member_array);
              if (index === -1) {
                this.member_array.push(
                  {
                    userid: user.uid,
                    avatar: user.avatar,
                    color: user.color,
                    email: user.email,
                    fullname: user.fullname,
                    imageurl: user.imageurl,
                    userOnline: members_isonline_array[user.uid]['isSignin']
                  })
              } else {
                this.logger.log('InfoGroupComponent member already exist in member_array');
              }
            }, (error) => {
              this.logger.error('InfoGroupComponent group detail loadContactDetail - ERROR  ', error);
            }, () => {
              count = count + 1;
              this.logger.log('InfoGroupComponent group detail loadContactDetail * COMPLETE * COUNT ', count);
              this.logger.log('InfoGroupComponent group detail loadContactDetail * COMPLETE * membersObjectLength ', this.membersObjectLength);
              if (count === this.membersObjectLength) {
                this.displaySkeletonScreen = false
              }
            });

        }

        this.groupDetail['member_array'] = this.member_array
        this.logger.log('InfoGroupComponent group detail after at the end', this.member_array);

      }
    }
  } // ./ ngOnChanges


}
