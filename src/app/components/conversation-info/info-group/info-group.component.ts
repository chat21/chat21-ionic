import { Component, OnInit, AfterViewInit, Input, OnChanges, OnDestroy } from '@angular/core';
import { AuthService } from 'src/chat21-core/providers/abstract/auth.service';
import { ImageRepoService } from 'src/chat21-core/providers/abstract/image-repo.service';
import { PresenceService } from 'src/chat21-core/providers/abstract/presence.service';
import { ContactsService } from 'src/app/services/contacts/contacts.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


import { filter } from 'rxjs/operators';
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
  constructor(
    public imageRepoService: ImageRepoService,
    public presenceService: PresenceService,
    public authService: AuthService,
    public contactsService: ContactsService
  ) {

    console.log('InfoGroupComponent HELLO !!!')
  }


  ngOnChanges() {
    console.log('InfoGroupComponent group detail ngOnChanges', this.groupDetail);

    if (this.groupDetail) {
      if (this.groupDetail.uid.startsWith('group-')) {
        const tiledeskToken = this.authService.getTiledeskToken();

        this.member_array = []
        const members_isonline_array = []

        for (const [key, value] of Object.entries(this.groupDetail.membersinfo)) {
          console.log('CONVERSATION-DETAIL group detail Key:', key, ' -Value: ', value);


          this.presenceService.userIsOnline(key)
            .pipe(filter((isOnline) => isOnline !== null))
            .subscribe((isOnline: any) => {
              console.log('InfoGroupComponent group detail BSIsOnline isOnline', isOnline)
              // this.member_is_online = isOnline;

              // test 
              this.groupDetail.membersinfo[key]['isSignin'] = isOnline.isOnline

              if (this.member_array.length > 0) {
                console.log('InfoGroupComponent group detail BSIsOnline HERE YES')
                // this.member_array['userOnline'] = isOnline.isOnline
                this.member_array.find(x => x.userid == isOnline.uid)['userOnline'] = isOnline.isOnline

              }

              console.log('InfoGroupComponent group detail BSIsOnline  this.groupDetail 2', this.groupDetail)

              console.log('InfoGroupComponent group detail BSIsOnline isOnline member_array', this.member_array)
              // this.member_array['userOnline'] = this.groupDetail.membersinfo[key]['isSignin']
              // if (this.member_array.length > 0) {
              //   // if (isOnline !== null) {
              // this.member_array.find(x => x.userid == isOnline.uid)['userOnline'] = isOnline.isOnline
              // this.member_array.find(x => x.userid == isOnline.uid)['userOnlineUID'] = isOnline.uid;
              //   console.log('InfoGroupComponent group detail BSIsOnline isOnline member_array 2', this.member_array)
              //   console.log('InfoGroupComponent group detail after assignment ', this.groupDetail)
              // }
              // console.log('InfoGroupComponent group detail BSIsOnline isOnline', this.member_is_online)


            })


            this.contactsService.loadContactDetail(tiledeskToken, key)
            .subscribe(user => {
              console.log('InfoGroupComponent group detail loadContactDetail RES', user);
              // console.log('InfoGroupComponent group detail this.presenceService.BSIsOnline.value()', this.presenceService.BSIsOnline.getValue);

              user.imageurl = this.imageRepoService.getImagePhotoUrl(key)
              // this.member_array.push({ userid: user.uid, avatar: user.avatar, color: user.color, email: user.email, fullname: user.fullname, imageurl: user.imageurl, userOnline: isOnline })
              this.member_array.push({ userid: user.uid, avatar: user.avatar, color: user.color, email: user.email, fullname: user.fullname, imageurl: user.imageurl, userOnline: this.groupDetail.membersinfo[user.uid]['isSignin'] })

            }, (error) => {
              console.log('InfoGroupComponent group detail loadContactDetail - ERROR  ', error);
            }, () => {
              console.log('InfoGroupComponent group detail loadContactDetail * COMPLETE *');

            });


          // this.contactsService.loadContactDetail(tiledeskToken, key)
          //   .subscribe(user => {
          //     console.log('InfoGroupComponent group detail loadContactDetail RES', user);
          //     // console.log('InfoGroupComponent group detail this.presenceService.BSIsOnline.value()', this.presenceService.BSIsOnline.getValue);

          //     user.imageurl = this.imageRepoService.getImagePhotoUrl(key)
          //     this.member_array.push({ userid: user.uid, avatar: user.avatar, color: user.color, email: user.email, fullname: user.fullname, imageurl: user.imageurl, userOnline: false })
          //     // this.member_array.push({ userid: user.uid, avatar: user.avatar, color: user.color, email: user.email, fullname: user.fullname, imageurl: user.imageurl, userOnline: this.groupDetail.membersinfo[user.uid]['isSignin'] })

          //   }, (error) => {
          //     console.log('InfoGroupComponent group detail loadContactDetail - ERROR  ', error);
          //   }, () => {
          //     console.log('InfoGroupComponent group detail loadContactDetail * COMPLETE *');

          //   });

        }


        this.groupDetail['member_array'] = this.member_array
        console.log('InfoGroupComponent group detail after at the end', this.member_array);

        // // 2nd for loop fo presence
        // for (const [key, value] of Object.entries(this.groupDetail.membersinfo)) {
        //   console.log('CONVERSATION-DETAIL group detail Key:', key, ' -Value: ', value);


        //   this.presenceService.userIsOnline(key)
        //     .pipe(filter((isOnline) => isOnline !== null))
        //     .subscribe((isOnline: any) => {
        //       console.log('InfoGroupComponent group detail BSIsOnline isOnline', isOnline)
        //       // this.member_is_online = isOnline;

        //       // test 
        //       // this.groupDetail.membersinfo[key]['isSignin'] = isOnline.isOnline

        //       console.log('InfoGroupComponent group detail BSIsOnline  this.groupDetail 2', this.groupDetail)

        //       console.log('InfoGroupComponent group detail BSIsOnline isOnline member_array', this.member_array)
        //       // this.member_array['userOnline'] = this.groupDetail.membersinfo[key]['isSignin']
        //       if (this.member_array.length > 0) {
        //       //   // if (isOnline !== null) {
        //       this.member_array.find(x => x.userid == isOnline.uid)['userOnline'] = isOnline.isOnline
        //       this.member_array.find(x => x.userid == isOnline.uid)['userOnlineUID'] = isOnline.uid;
        //       //   console.log('InfoGroupComponent group detail BSIsOnline isOnline member_array 2', this.member_array)
        //       //   console.log('InfoGroupComponent group detail after assignment ', this.groupDetail)
        //       }
        //       // console.log('InfoGroupComponent group detail BSIsOnline isOnline', this.member_is_online)
        //     })





        //   // this.contactsService.loadContactDetail(tiledeskToken, key)
        //   //   .subscribe(user => {
        //   //     console.log('InfoGroupComponent group detail loadContactDetail RES', user);
        //   //     // console.log('InfoGroupComponent group detail this.presenceService.BSIsOnline.value()', this.presenceService.BSIsOnline.getValue);

        //   //     user.imageurl = this.imageRepoService.getImagePhotoUrl(key)
        //   //     // this.member_array.push({ userid: user.uid, avatar: user.avatar, color: user.color, email: user.email, fullname: user.fullname, imageurl: user.imageurl, userOnline: false })
        //   //     this.member_array.push({ userid: user.uid, avatar: user.avatar, color: user.color, email: user.email, fullname: user.fullname, imageurl: user.imageurl, userOnline: this.groupDetail.membersinfo[user.uid]['isSignin'] })

        //   //   }, (error) => {
        //   //     console.log('InfoGroupComponent group detail loadContactDetail - ERROR  ', error);
        //   //   }, () => {
        //   //     console.log('InfoGroupComponent group detail loadContactDetail * COMPLETE *');

        //   //   });

        // }

        // console.log('InfoGroupComponent group detail after at the end 2nd loop', this.member_array);

      }
    }
  }

  ngOnInit() {


    // this.groupDetail.avatar = avatarPlaceholder(this.groupDetail.name);
    // this.groupDetail.color = getColorBck(this.groupDetail.name);

  }

  ngAfterViewInit() {
    console.log('InfoGroupComponent - ngAfterViewInit');

    // console.log('InfoGroupComponent conversationWith', this.conversationWith);
  }

  ngOnDestroy() {
    // console.log('ngOnDestroy ConversationDetailPage: ');

    console.log('InfoGroupComponent group detail ngOnDestroy');
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
