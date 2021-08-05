import { TiledeskAuthService } from './../../../../chat21-core/providers/tiledesk/tiledesk-auth.service';
import { Component, OnInit, AfterViewInit, Input, OnChanges, OnDestroy, Renderer2 } from '@angular/core';
import { ImageRepoService } from 'src/chat21-core/providers/abstract/image-repo.service';
import { PresenceService } from 'src/chat21-core/providers/abstract/presence.service';
import { ContactsService } from 'src/app/services/contacts/contacts.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { filter } from 'rxjs/operators';

// Logger
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';

// import {avatarPlaceholder, getColorBck} from 'src/chat21-core/utils/utils-user';
@Component({
  selector: 'app-info-group',
  templateUrl: './info-group.component.html',
  styleUrls: ['./info-group.component.scss'],
})
export class InfoGroupComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  // objectKeys = Object.keys;

  @Input() groupDetail: any;
  member_is_online;
  member_array: any
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

  constructor(
    public imageRepoService: ImageRepoService,
    public presenceService: PresenceService,
    public tiledeskAuthService: TiledeskAuthService,
    public contactsService: ContactsService,
    public renderer: Renderer2
  ) {

    this.logger.log('InfoGroupComponent HELLO !!!')
  }


  // copyMemberUID(memberid) {
  //   var copyText = document.createElement("input");                  
  //   copyText.setAttribute("type", "text");
  //   copyText.setAttribute("value", memberid);

  //   document.body.appendChild(copyText); 
  //   copyText.select();
  //   copyText.setSelectionRange(0, 99999); /*For mobile devices*/
  //   document.execCommand("copy");
  //   this.logger.log("Copied the text: " + copyText.value);
  //   const tootipElem = <HTMLElement>document.querySelector('.chat-tooltip');
  //   this.renderer.appendChild(tootipElem, this.renderer.createText('Copied!'))

  // }

  ngOnChanges() {
    this.logger.log('InfoGroupComponent group detail ngOnChanges', this.groupDetail);

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
                this.member_array.find(x => x.userid == isOnline.uid)['userOnline'] = isOnline.isOnline
              }
              this.logger.log('InfoGroupComponent group detail BSIsOnline  this.groupDetail 2', this.groupDetail)
              this.logger.log('InfoGroupComponent group detail BSIsOnline isOnline member_array', this.member_array)
          });

          this.contactsService.loadContactDetail(tiledeskToken, key)
            .subscribe(user => {
              this.logger.log('InfoGroupComponent group detail loadContactDetail RES', user);
              // this.logger.log('InfoGroupComponent group detail this.presenceService.BSIsOnline.value()', this.presenceService.BSIsOnline.getValue);

              user.imageurl = this.imageRepoService.getImagePhotoUrl(key)
              // this.member_array.push({ userid: user.uid, avatar: user.avatar, color: user.color, email: user.email, fullname: user.fullname, imageurl: user.imageurl, userOnline: isOnline })
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

            }, (error) => {
              this.logger.error('InfoGroupComponent group detail loadContactDetail - ERROR  ', error);
            }, () => {
              this.logger.log('InfoGroupComponent group detail loadContactDetail * COMPLETE *');

            });


          // this.contactsService.loadContactDetail(tiledeskToken, key)
          //   .subscribe(user => {
          //     this.logger.log('InfoGroupComponent group detail loadContactDetail RES', user);
          //     // this.logger.log('InfoGroupComponent group detail this.presenceService.BSIsOnline.value()', this.presenceService.BSIsOnline.getValue);

          //     user.imageurl = this.imageRepoService.getImagePhotoUrl(key)
          //     this.member_array.push({ userid: user.uid, avatar: user.avatar, color: user.color, email: user.email, fullname: user.fullname, imageurl: user.imageurl, userOnline: false })
          //     // this.member_array.push({ userid: user.uid, avatar: user.avatar, color: user.color, email: user.email, fullname: user.fullname, imageurl: user.imageurl, userOnline: this.groupDetail.membersinfo[user.uid]['isSignin'] })

          //   }, (error) => {
          //     this.logger.log('InfoGroupComponent group detail loadContactDetail - ERROR  ', error);
          //   }, () => {
          //     this.logger.log('InfoGroupComponent group detail loadContactDetail * COMPLETE *');

          //   });

        }


        this.groupDetail['member_array'] = this.member_array
        this.logger.log('InfoGroupComponent group detail after at the end', this.member_array);

        // // 2nd for loop fo presence
        // for (const [key, value] of Object.entries(this.groupDetail.membersinfo)) {
        //   this.logger.log('CONVERSATION-DETAIL group detail Key:', key, ' -Value: ', value);


        //   this.presenceService.userIsOnline(key)
        //     .pipe(filter((isOnline) => isOnline !== null))
        //     .subscribe((isOnline: any) => {
        //       this.logger.log('InfoGroupComponent group detail BSIsOnline isOnline', isOnline)
        //       // this.member_is_online = isOnline;

        //       // test 
        //       // this.groupDetail.membersinfo[key]['isSignin'] = isOnline.isOnline

        //       this.logger.log('InfoGroupComponent group detail BSIsOnline  this.groupDetail 2', this.groupDetail)

        //       this.logger.log('InfoGroupComponent group detail BSIsOnline isOnline member_array', this.member_array)
        //       // this.member_array['userOnline'] = this.groupDetail.membersinfo[key]['isSignin']
        //       if (this.member_array.length > 0) {
        //       //   // if (isOnline !== null) {
        //       this.member_array.find(x => x.userid == isOnline.uid)['userOnline'] = isOnline.isOnline
        //       this.member_array.find(x => x.userid == isOnline.uid)['userOnlineUID'] = isOnline.uid;
        //       //   this.logger.log('InfoGroupComponent group detail BSIsOnline isOnline member_array 2', this.member_array)
        //       //   this.logger.log('InfoGroupComponent group detail after assignment ', this.groupDetail)
        //       }
        //       // this.logger.log('InfoGroupComponent group detail BSIsOnline isOnline', this.member_is_online)
        //     })





        //   // this.contactsService.loadContactDetail(tiledeskToken, key)
        //   //   .subscribe(user => {
        //   //     this.logger.log('InfoGroupComponent group detail loadContactDetail RES', user);
        //   //     // this.logger.log('InfoGroupComponent group detail this.presenceService.BSIsOnline.value()', this.presenceService.BSIsOnline.getValue);

        //   //     user.imageurl = this.imageRepoService.getImagePhotoUrl(key)
        //   //     // this.member_array.push({ userid: user.uid, avatar: user.avatar, color: user.color, email: user.email, fullname: user.fullname, imageurl: user.imageurl, userOnline: false })
        //   //     this.member_array.push({ userid: user.uid, avatar: user.avatar, color: user.color, email: user.email, fullname: user.fullname, imageurl: user.imageurl, userOnline: this.groupDetail.membersinfo[user.uid]['isSignin'] })

        //   //   }, (error) => {
        //   //     this.logger.log('InfoGroupComponent group detail loadContactDetail - ERROR  ', error);
        //   //   }, () => {
        //   //     this.logger.log('InfoGroupComponent group detail loadContactDetail * COMPLETE *');

        //   //   });

        // }

        // this.logger.log('InfoGroupComponent group detail after at the end 2nd loop', this.member_array);

      }
    }
  }

  ngOnInit() {


    // this.groupDetail.avatar = avatarPlaceholder(this.groupDetail.name);
    // this.groupDetail.color = getColorBck(this.groupDetail.name);

  }

  ngAfterViewInit() {
    this.logger.log('InfoGroupComponent - ngAfterViewInit');

    // this.logger.log('InfoGroupComponent conversationWith', this.conversationWith);
  }

  ngOnDestroy() {
    // this.logger.log('ngOnDestroy ConversationDetailPage: ');

    this.logger.log('InfoGroupComponent group detail ngOnDestroy');
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
