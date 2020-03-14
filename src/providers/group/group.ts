import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Events } from 'ionic-angular';
import { Http, Headers, RequestOptions } from '@angular/http';
// import { Observable } from 'rxjs/Observable';
import { Observable } from 'rxjs';

// import 'rxjs/add/observable/fromPromise';
// import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { BehaviorSubject } from 'rxjs';


// models
import { GroupModel } from '../../models/group';
// firebase
import * as firebase from 'firebase/app';
// utils
import { isExistInArray, getFormatData, searchIndexInArrayForUid } from '../../utils/utils';
import { TYPE_SUPPORT_GROUP } from '../../utils/constants';
// services
import { ChatManager } from '../../providers/chat-manager/chat-manager';
import { UserService } from '../../providers/user/user';
import { MessagingService } from '../../providers/messaging-service';

import { AppConfigProvider } from '../../providers/app-config/app-config';



@Injectable()
export class GroupService {

  private BASE_URL_LEAVE_GROUP: string;
  public groupDetail: GroupModel;
  observable: any;
  public arrayMembers;
  public listRefMembersInfo = [];
  refLoadGroupDetail;

  constructor(
    public http: Http,
    public events: Events,
    public msgService: MessagingService,
    public appConfig: AppConfigProvider,
    public chatManager: ChatManager,
    public userService: UserService
  ) {
    //this.BASE_URL_LEAVE_GROUP = 'https://us-central1-chat-v2-dev.cloudfunctions.net/';
    this.BASE_URL_LEAVE_GROUP = this.appConfig.getConfig().firebaseConfig.chat21ApiUrl;
    this.observable = new BehaviorSubject<boolean>(null);
    console.log('Hello GroupProvider Provider');
  }

  // /** */
  // initGroupDetails(uidUser, uidGroup) {
  //   const tenant = this.chatManager.getTenant();
  //   const urlNodeContacts = '/apps/' + tenant + '/users/' + uidUser + '/groups/' + uidGroup;
  //   console.log("urlNodeContacts", urlNodeContacts);
  //   return firebase.database().ref(urlNodeContacts);
  // }

  // /** */
  // loadGroupDetail(uidUser, uidGroup) {
  //   console.log("GroupService::loadGroudDetail::uidUser:", uidUser, "uidGroup:", uidGroup);
  //   var that = this;
  //   const reference = this.initGroupDetails(uidUser, uidGroup);
  //   // console.log("GroupService::loadGroudDetail::reference:", reference.toString());
  //   reference.on('value', function (snapshot) {
  //     console.log("GroupService::loadGroudDetail::snapshot:", snapshot.val());
  //     that.events.publish(uidGroup + '-details', snapshot);
  //   });
  // }


  loadGroupDetail(uidUser, uidGroup, key) {
    const that = this;
    const tenant = this.chatManager.getTenant();
    const urlNode = '/apps/' + tenant + '/users/' + uidUser + '/groups/' + uidGroup;
    console.log("url groups: ", urlNode);
    this.refLoadGroupDetail = firebase.database().ref(urlNode);
    this.refLoadGroupDetail.on('value', function (snapshot) {
      console.log("on value: ", key, snapshot);
      that.events.publish(key, snapshot);
      that.events.publish('conversationGroupDetails', snapshot);
    });
  }

  /**
   * 
   */
  leaveAGroup(uidGroup, uidUser, callback) {
    const appId = this.chatManager.getTenant();
    // const token = this.userService.returnToken();
    var that = this;
    firebase.auth().currentUser.getIdToken(/* forceRefresh */ true)
    .then(function (token) {
      console.log('token: ', token);
      const headers = new Headers();
      headers.append('Accept', 'application/json');
      headers.append('Content-Type', 'application/json');
      headers.append('Authorization', 'Bearer ' + token);

      const options = new RequestOptions({ headers: headers });
     
      const url = that.BASE_URL_LEAVE_GROUP + '/api/' + appId + '/groups/' + uidGroup + '/members/' + uidUser;
      console.log('url: ', url);
      console.log('token: ', token);
      const body = {
        'app_id': appId
      };
      console.log('------------------> options: ', options);
      console.log('------------------> body: ', JSON.stringify(body));
      that.http
        .delete(url, options)
        .map((res) => {
          callback(res, null);
        }).subscribe();
    }).catch(function (error) {
      // Handle error
      console.log('idToken error: ', error);
      callback(null, error);
    });
       
  }




  closeGroup(uidGroup, callback) {
    const appId = this.chatManager.getTenant();
    // const token = this.userService.returnToken();
    var that = this;
    firebase.auth().currentUser.getIdToken(/* forceRefresh */ true)
      .then(function (token) {
        console.log('idToken.', token);
        const headers = new Headers();
        headers.append('Accept', 'application/json');
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', 'Bearer ' + token);

        const options = new RequestOptions({ headers: headers });
        const url = that.BASE_URL_LEAVE_GROUP + '/supportapi/' + appId + '/groups/' + uidGroup;
        const body = {};
        console.log('---------------> 1 - url: ', url);
        console.log('---------------> 2 - options: ', options);
        console.log('------------------> that.http: ', that.http);
        that.http
          .put(url, body, options)
          .map((res) => {
            callback(res, null);
          }).subscribe();
      }).catch(function (error) {
        // Handle error
        console.log('idToken error: ', error);
        callback(null, error);
      });
  }


  getUidMembers(members): string[] {
    this.arrayMembers = [];
    const memberStr = JSON.stringify(members);
    JSON.parse(memberStr, (key, value) => {
      this.arrayMembers.push(key);
    });
    return this.arrayMembers;
  }


  isSupportGroup(uid) {
    if (uid.indexOf(TYPE_SUPPORT_GROUP) === 0) {
      return true;
    }
    return false;
  }



  // ========= begin:: subscribe MembersInfo ============//
  /** */

  // getMembersInfo(uidGroup, tenant, uidUser, uidMember){
  //   const urlNodeContacts = '/apps/'+tenant+'/users/'+uidUser+'/groups/'+uidGroup+'/membersinfo/'+uidMember;
  //   console.log("getMembersInfo: ",urlNodeContacts);
  //   var ref =  firebase.database().ref(urlNodeContacts).once('value');
  //   return ref;
  // }

  /** */
  // loadMembersInfo(uidGroup, tenant, uidUser) {
  //   const that = this;
  //   const urlNodeContacts = '/apps/' + tenant + '/users/' + uidUser + '/groups/' + uidGroup + '/membersinfo';
  //   console.log("initMembersInfo: ", urlNodeContacts);
  //   var ref = firebase.database().ref(urlNodeContacts);
  //   ref.on('value', function (snapshot) {
  //     console.log("VALUE: ", snapshot.val());
  //     that.events.publish('callbackCheckVerifiedMembers-'+uidUser, snapshot);
  //   });
  //   this.listRefMembersInfo.push(ref);
  // }

  loadMembersInfo(uidGroup, tenant, uidUser) {
    const that = this;
    //const urlNodeContacts = '/apps/tilechat/groups/support-group-LRmSLsFn5aI3E_5IkiQ/attributes';
    const urlNodeContacts = '/apps/' + tenant +  '/users/' + uidUser + '/groups/' + uidGroup +'/attributes';
    console.log("initMembersInfo1: ", urlNodeContacts);
    var ref = firebase.database().ref(urlNodeContacts);
    ref.on('value', function (snapshot) {
      console.log("VALUE1: ", snapshot.val());
      that.events.publish('callbackCheckVerifiedMembers-'+uidUser, snapshot);
    });
    this.listRefMembersInfo.push(ref);
  }
  // reference.on("child_changed", function(childSnapshot) {
  //   that.onChangedMembersInfo(childSnapshot);
  // });
  // reference.on("child_removed", function(childSnapshot) {
  //   that.onRemovedMembersInfo(childSnapshot);
  // });
  // reference.on("child_added", function(childSnapshot) {
  //   that.onAddedMembersInfo(childSnapshot);
  // })

  onDisconnectMembersInfo() {
    this.listRefMembersInfo.forEach(ref => {
      console.log("onDisconnectMembersInfo: ", ref);
      ref.off();
    });
    this.listRefMembersInfo = [];
  }

  /** */
  onDisconnectLoadGroupDetail() {
    if(this.refLoadGroupDetail){
      this.refLoadGroupDetail.off();
    }
  }
  



  // ========= end:: subscribe MembersInfo ==============//

}