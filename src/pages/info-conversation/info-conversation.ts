import { Component, NgZone, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AlertController, Events, LoadingController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';

import { DomSanitizer} from '@angular/platform-browser';

// models
import { UserModel } from '../../models/user';
import { GroupModel } from '../../models/group';

// services
import { UploadService } from '../../providers/upload-service/upload-service';
import { UserService } from '../../providers/user/user';
import { GroupService } from '../../providers/group/group';
import { ChatManager } from '../../providers/chat-manager/chat-manager';
import { ChatPresenceHandler } from '../../providers/chat-presence-handler';

import { environment } from '../../environments/environment';

// FIREBASESTORAGE_BASE_URL_IMAGE
// URL_PROJECT_ID
// URL_TICKET_CHAT
// CHAT_SEND_BY_EMAIL_LINK
// URL_VIDEO_CHAT,

// utils
import { TYPE_SUPPORT_GROUP, TYPE_GROUP, SYSTEM, URL_NO_IMAGE, LABEL_NOICON } from '../../utils/constants';
import { jsonToArray, avatarPlaceholder, getColorBck, searchIndexInArrayForUid, getFormatData, createConfirm, urlify, isExistInArray, createLoading } from '../../utils/utils';
import { PlaceholderPage } from '../placeholder/placeholder';

import { ChatConversationsHandler } from '../../providers/chat-conversations-handler';
import { ChatArchivedConversationsHandler } from '../../providers/chat-archived-conversations-handler';

import { ChatConversationHandler } from '../../providers/chat-conversation-handler';
import { TiledeskConversationProvider } from '../../providers/tiledesk-conversation/tiledesk-conversation';
import { ConversationModel } from '../../models/conversation';

import { NavProxyService } from '../../providers/nav-proxy';
import { AppConfigProvider } from '../../providers/app-config/app-config';



@Component({
  selector: 'page-info-conversation',
  templateUrl: 'info-conversation.html',
})
export class InfoConversationPage {
  // ========= begin:: Input/Output values ============//
  @Output() eventClose = new EventEmitter();
  @Output() eventOpenInfoUser = new EventEmitter<UserModel>();
  @Output() eventOpenInfoAdvanced = new EventEmitter<any>();
  @Input() tenant: string;
  @Input() attributes: any = {};
  @Input() conversationWith: string;
  @Input() channelType: string;
  // ========= end:: Input/Output values ============//

  public group: any;
  public uidUserAuthenticated: string;
  public signInProvider: string;
  // public uidSelected: string;
  public conversationSelected: ConversationModel;
  public userDetail: UserModel;
  public groupDetail: GroupModel;
  public listMembers: UserModel[];
  public currentUserDetail: UserModel;
  public profileYourself: boolean;
  private customAttributes = [];
  public attributesClient: string = '';
  public attributesSourcePage: string = '';
  public attributesDepartments: string = '';
  public online: boolean;
  public lastConnectionDate: string;
  public conversationEnabled: boolean;

  public TYPE_GROUP = TYPE_GROUP;
  // public CHAT_SEND_BY_EMAIL_LINK = CHAT_SEND_BY_EMAIL_LINK;
  // public URL_VIDEO_CHAT = URL_VIDEO_CHAT;

  private loadingDialog: any;
  private confirmDialog: any;

  private isLoggedUserGroupMember: boolean;
  private subscriptions = [];
  // private FIREBASESTORAGE_BASE_URL_IMAGE: string;

  private supportMode = environment.supportMode;
  private urlConversation;
  private DASHBOARD_URL;

  constructor(
    public events: Events,
    public chatManager: ChatManager,
    public userService: UserService,
    public groupService: GroupService,
    public upSvc: UploadService,
    public zone: NgZone,
    private conversationsHandler: ChatConversationsHandler,
    private chatArchivedConversationsHandler: ChatArchivedConversationsHandler,
    private conversationHandler: ChatConversationHandler,
    private tiledeskConversationProvider: TiledeskConversationProvider,
    public alertCtrl: AlertController,
    public translate: TranslateService,
    private loadingCtrl: LoadingController,
    private navProxy: NavProxyService,
    public chatPresenceHandler: ChatPresenceHandler,
    public appConfig: AppConfigProvider,
    private sanitizer: DomSanitizer
  ) {
    //this.events.subscribe('closeDetailConversation', this.closeDetailConversation);
    console.log('**** constructor InfoConversationPage *****');
    const that = this;
    // this.FIREBASESTORAGE_BASE_URL_IMAGE = this.appConfig.getConfig().storageBucket;
    setTimeout(function () {
      that.initialize();
    }, 100);

    this.DASHBOARD_URL = this.appConfig.getConfig().DASHBOARD_URL;
    this.urlConversation = this.sanitizer.bypassSecurityTrustResourceUrl(this.DASHBOARD_URL);
  }

  ngOnInit() {
    console.log('ngOnInit:InfoConversationPage');

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad:InfoConversationPage');
  }

  ionViewWillEnter() {
    console.log('ionViewWillEnter');

  }

  ionViewWillLeave() {
    console.log('------------> ionViewWillLeave:InfoConversationPage');
    this.unsubscribeAll();
  }

  /**
   * 1 - set subscriptions
   * 2 - load group details (async)
   * 3 - checkVerifiedMembers
   * 
   * recupero array uid membri
   */
  initialize() {
    console.log('InfoConversationPage::initialize', this.conversationWith);
    

    this.profileYourself = false;
    this.online = false;
    this.isLoggedUserGroupMember = false;
    this.listMembers = [];
    this.subscriptions = [];
    this.profileYourself = false;
    this.currentUserDetail = this.chatManager.getLoggedUser();
    this.userDetail = new UserModel('', '', '', '', '', '', '', '', false, false, '');
    this.groupDetail = new GroupModel('', 0, '', [], [], '', '');
    this.conversationSelected = this.conversationsHandler.getConversationByUid(this.conversationWith);
    if (!this.conversationSelected) {
      this.conversationSelected = this.chatArchivedConversationsHandler.getConversationByUid(this.conversationWith);
    }
    if (this.conversationSelected) {
      if (this.conversationSelected.attributes && this.conversationSelected.attributes.projectId){
        var projectId = this.conversationSelected.attributes.projectId;
        console.log('conversationWith::', this.conversationWith);
        console.log('projectId::', projectId);
        var urlConversationTEMP = this.sanitizer.bypassSecurityTrustResourceUrl(this.DASHBOARD_URL+"#/project/"+projectId+"/request-for-panel/"+this.conversationWith);
        this.urlConversation = urlConversationTEMP;
      }
      console.log('urlConversation::', this.urlConversation);
      this.populateDetail();
      this.setSubscriptions();
    }
    
  }


  /** selectUserDetail
   * se uid conversazione esiste popolo:
   * 1 - dettaglio current user
   * 2 - dettaglio gruppo
   * 3 - dettaglio user
  */
  populateDetail() {
    console.log('InfoConversationPage::populateDetail');
    // if(!this.conversationSelected.image || this.conversationSelected.image === undefined ) {
    //   this.conversationSelected.image = '';
    // }
    if (!this.conversationWith) {
      console.log('NO CONVERSATION');
      return;
    } else if (this.conversationWith === this.currentUserDetail.uid) {
      console.log('MYSELF');
      this.profileYourself = true;
      this.userDetail = this.currentUserDetail;
    } else if (this.channelType === TYPE_GROUP) {
      console.log('GRUPPO');
      this.profileYourself = false;
      this.loadGroupDetail();
      this.events.subscribe(this.conversationWith + '-listener', this.subscribeConversationListener);
      this.conversationsHandler.addConversationListener(this.currentUserDetail.uid, this.conversationWith);
    } else {
      console.log('CONVERSATION');
      this.profileYourself = false;
      // status user conversation with
      this.userIsOnline(this.conversationWith);
      this.loadUserDetail();
    }
  }


  // ========= begin:: set User Detail ============//
  /** */
  loadUserDetail() {
    const that = this;
    this.userService.loadUserDetail(this.conversationWith)
      .then(function (snapshot) {
        if (snapshot.val()) {
          that.setDetailUser(snapshot);
        }
      })
      .catch(function (err) {
        console.error('Unable to get permission to notify.', err);
      });
  }

  /** */
  setDetailUser(snapshot) {
    const user = snapshot.val();
    const fullname = user.firstname + " " + user.lastname;
    this.userDetail = new UserModel(
      snapshot.key,
      user.email,
      user.firstname,
      user.lastname,
      fullname.trim(),
      user.imageurl,
      '',
      '',
      false,
      false,
      ''
    );
  }
  // ========= end:: set User Detail ============//


  /** SUBSCRIPTIONS */
  setSubscriptions() {
    console.log('InfoConversationPage::setSubscriptions');
    // this.events.subscribe('changeStatusUserSelected', this.subcribeChangeStatusUserSelected);
    this.events.subscribe('PopupConfirmation', this.subcribePopupConfirmation);
    this.addSubscription('PopupConfirmation');
  }



  /** 
   * init group details subscription
   */
  loadGroupDetail() {
    const keySubscription = 'groupDetails';
    if (this.addSubscription(keySubscription)) {
      this.events.subscribe(keySubscription, this.returnLoadGroupDetail);
      this.groupService.loadGroupDetail(this.currentUserDetail.uid, this.conversationWith, keySubscription);
    }
  }

  /**
   * information detail group called of groupService.loadGroupDetail
   */
  returnLoadGroupDetail = (snapshot) => {
    console.log('InfoConversationPage::subscribeGroupDetails', snapshot.val());
    var that = this;
    //setTimeout(function () {
      if (snapshot.val()) {
        that.group = snapshot.val();
        if (that.group.attributes) {
          that.attributes = that.group.attributes;
          that.updateAttributes(that.group.attributes);
        }
        that.groupDetail = new GroupModel(
          snapshot.key,
          getFormatData(that.group.createdOn),
          that.group.iconURL,
          that.groupService.getUidMembers(that.group.members),
          that.group.memberinfo,
          that.group.name,
          that.group.owner
        );
        if (!that.groupDetail.iconURL || that.groupDetail.iconURL === LABEL_NOICON) {
          that.groupDetail.iconURL = URL_NO_IMAGE;
        }
        that.getListMembers(that.groupDetail.members);
        console.log('groupDetail: ', that.groupDetail, that.uidUserAuthenticated);
        if (!isExistInArray(that.groupDetail.members, that.currentUserDetail.uid) || that.groupDetail.members.length <= 1) {
          that.isLoggedUserGroupMember = false;
        } else if (isExistInArray(that.groupDetail.members, that.currentUserDetail.uid)) {
          that.isLoggedUserGroupMember = true;
        }
  
      }
    //}, 0);
  }

  private updateAttributes(attributes) {
    console.log('InfoConversationPage::updateAttributes', attributes);
    if (attributes) {
      this.attributesClient = (attributes.client) ? attributes.client : '';
      this.attributesSourcePage = (attributes.sourcePage) ? attributes.sourcePage : '';
      //this.attributesSourcePage = (attributes.sourcePage) ? urlify(attributes.sourcePage) : '';
      this.attributesDepartments = (attributes.departments) ? this.arrayDepartments(attributes.departments).join(", ") : '';
      this.createCustomAttributesMap(attributes);
    }
  }

  /** 
   * 1 - passo array id menbri della conversazione
   * 2 - verifico se l'uid è valido e diverso da SYSTEM
   * 3 - mi sottoscrivo al nodo del dettaglio utente per recuperare le informazioni
   * 4 - creo un new userDetail lo aggiungo all'array utenti, mi sottoscrivo allo stato (online/offline)
  */
  private getListMembers(members) {
    let that = this;
    // autenticazione
    // let uidUserAuthenticated;
    this.uidUserAuthenticated = '';
    let emailUserAuthenticated;
    let fullnameUserAuthenticated;
    this.signInProvider = 'anonymous';
    let decoded;
    let projectId;
    if (this.attributes) {
      if (this.attributes.projectId) {
        projectId = this.attributes.projectId;
      }
      if (this.attributes.userFullname) {
        fullnameUserAuthenticated = this.attributes.userFullname;
      }
      if (this.attributes.userEmail) {
        emailUserAuthenticated = this.attributes.userEmail;
      }
      if (this.attributes.senderAuthInfo) {
        if (this.attributes.senderAuthInfo.authVar) {
          if (this.attributes.senderAuthInfo.authVar.uid) {
            this.uidUserAuthenticated = this.attributes.senderAuthInfo.authVar.uid;
          }
          if (this.attributes.senderAuthInfo.authVar.token) {
            if (this.attributes.senderAuthInfo.authVar.token.decoded) {
              decoded = this.attributes.senderAuthInfo.authVar.token.decoded;
              //decoded = this.completeDecoded(this.attributes.senderAuthInfo.authVar.token.decoded);
            }
            if (this.attributes.senderAuthInfo.authVar.token.firebase) {
              if (this.attributes.senderAuthInfo.authVar.token.firebase.sign_in_provider) {
                this.signInProvider = this.attributes.senderAuthInfo.authVar.token.firebase.sign_in_provider;
              }
            }
          }
        }
      }
    }
    console.log(' this.uidUserAuthenticated: ', this.uidUserAuthenticated, this.attributes);
    this.listMembers = [];
    console.log(' <----- members -----> ', members, this.listMembers);
    members.forEach(member => {
      let userDetail;
      if (member.trim() !== '' && member.trim() !== SYSTEM) {
        this.userService.getUserDetail(member)
          .then(function (snapshot) {
            if (snapshot.val()) {
              const user = snapshot.val();
              const fullname = user.firstname + " " + user.lastname;
              let avatar;
              let color;
              let decodedUid;
              if (snapshot.key === that.uidUserAuthenticated) {
                decodedUid = decoded;
              }
              let imageurl = that.getImageUrlThumb(snapshot.key);
              userDetail = new UserModel(
                snapshot.key,
                user.email,
                user.firstname,
                user.lastname,
                fullname.trim(),
                imageurl,
                avatar,
                color,
                false,
                false,
                decodedUid
              );

            } else {
              userDetail = new UserModel(
                snapshot.key,
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                false,
                false,
                ''
              );
            }

            // set fullname
            if (!userDetail.fullname || userDetail.fullname === '') {
              userDetail.fullname = that.translate.get('LABEL_GUEST')['value'];
              console.log('0 - userDetail.fullname------------->', userDetail.fullname);
            }
            if (that.uidUserAuthenticated === snapshot.key && fullnameUserAuthenticated && fullnameUserAuthenticated !== 'undefined') {
              console.log('1 - fullnameUserAuthenticated------------->', fullnameUserAuthenticated);
              userDetail.fullname = fullnameUserAuthenticated;
            }
            if (userDetail.firstname || userDetail.lastname) {
              userDetail.fullname = userDetail.firstname + ' ' + userDetail.lastname;
              console.log('2 - userDetail.fullname------------->', userDetail.fullname);
            }

            userDetail.checked = false;
            if (that.signInProvider === 'custom' && that.uidUserAuthenticated === snapshot.key) {
              console.log('2.5 - uidUserAuthenticated------------->', that.uidUserAuthenticated, snapshot.key);
              userDetail.checked = true;
              userDetail.email = emailUserAuthenticated;
              userDetail.decoded = decoded;
              if (fullnameUserAuthenticated) {
                userDetail.fullname = fullnameUserAuthenticated;
                console.log('3 - userDetail.fullname------------->', userDetail.fullname);
              }
              if (that.signInProvider === 'custom' && userDetail.decoded && userDetail.decoded.name) {
                userDetail.fullname = userDetail.decoded.name;
                console.log('4 - userDetail.fullname------------->', userDetail.fullname);
              }
            }
            userDetail.avatar = avatarPlaceholder(userDetail.fullname);
            userDetail.color = getColorBck(userDetail.fullname);
            console.log('userDetail------------->', userDetail);
            // ADD MEMBER TO ARRAY
            let position = that.listMembers.findIndex(i => i.uid === userDetail.uid);
            if (position == -1 ) {            
              that.listMembers.push(userDetail);
            }
            // ONLINE/OFFLINE

            if(userDetail.uid.startsWith('bot_') || userDetail.uid == that.currentUserDetail.uid){
              userDetail.online = true;
            } else {
              that.userIsOnline(userDetail.uid);
            }
            // MEMBER CHECKED!!
            // that.checkVerifiedMembers(userDetail.uid);
          });
      }
    });
  }

  getImageUrlThumb(uid: string) {
    let imageurl = this.appConfig.getConfig().FIREBASESTORAGE_BASE_URL_IMAGE + environment.firebaseConfig.storageBucket + '/o/profiles%2F' + uid + '%2Fthumb_photo.jpg?alt=media';
    return imageurl;
  }
  /**
   * carico url immagine profilo passando id utente
   */
  //   setImageUser(userDetail){
  //     const that = this;
  //     if(userDetail.uid){
  //         this.upSvc.display(userDetail.uid, 'thumb')
  //         .then(onResolve, onReject);
  //     }
  //     function onResolve(foundURL) { 
  //         console.log('foundURL', userDetail, foundURL);
  //         userDetail.imageurl = foundURL; 
  //         // salvo in cache e sul DB!!!
  //     } 
  //     function onReject(error){ 
  //         console.log('error.code', error); 
  //         userDetail.imageurl = '';
  //     }
  // }


  //// SUBSCRIBTIONS ////
  /** 
  * subscriptions list 
  */
  initSubscriptions(uid) {
    console.log('initSubscriptions.', uid);
    //this.arrayUsersStatus['7CzGOPMbDrXq3Im7APVq5K3advl2'] = true; 
    // subscribe stato utente con cui si conversa ONLINE
    // this.events.subscribe('statusUser:online-' + uid, this.statusUserOnline);
    // // subscribe stato utente con cui si conversa ONLINE
    // this.events.subscribe('statusUser:offline-' + uid, this.statusUserOffline);
  }


  //// UNSUBSCRIPTIONS ////
  /**
   * unsubscribe all subscribe events
   */
  unsubescribeAll() {
    // this.arrayUsersStatus.forEach((value, key) => {
    //   console.log("unsubscribe key", key)
    //   this.events.unsubscribe('statusUser:online-' + key, null);
    //   this.events.unsubscribe('statusUser:offline-' + key, null);
    // });

  }




  // subcribeOnOpenInfoConversation: any = (openInfoConversation, uidUserSelected, channel_type, attributes)  => {
  //   console.log('InfoConversationPage::subcribeOnOpenInfoConversation');
  //   // se openInfoConversation === false il pannello è chiuso!
  //   if(!openInfoConversation){ return; } 
  //   this.uidSelected = uidUserSelected;
  //   this.channel_type = channel_type;
  //   this.attributes = attributes;
  //   this.updateAttributes(this.attributes);
  //   this.populateDetail();
  // };

  // private updateAttributes(attributes) {
  //   console.log('InfoConversationPage::updateAttributes');
  //   if (attributes) {

  //     // console.log("InfoConversationPage::subcribeOnOpenInfoConversation::attributes", attributes)

  //     this.attributesClient = (attributes.client) ? attributes.client : '';
  //     this.attributesSourcePage = (attributes.sourcePage) ? urlify(attributes.sourcePage) : '';
  //     //this.attributesDepartments = (attributes.departments)?this.arrayDepartments(attributes.departments).join(", "):'';

  //     this.createCustomAttributesMap(attributes);
  //     // console.log("InfoConversationPage::subcribeOnOpenInfoConversation::attributes", attributes);
  //     // console.log("InfoConversationPage::subcribeOnOpenInfoConversation::customAttributes", this.customAttributes);
  //   }
  // }

  /**  */
  subcribePopupConfirmation: any = (resp, action) => {
    var that = this;
    console.log("subcribePopupConfirmation", resp, action);
    var LABEL_ANNULLA = this.translate.get('CLOSE_ALERT_CANCEL_LABEL')['value'];
    if (resp === LABEL_ANNULLA) { return; }
    if (action === 'leave') {
      // create and show loading dialog
      var spinnerMessage;
      this.translate.get('LEAVING_GROUP_SPINNER_MSG').subscribe(
        value => {
          spinnerMessage = value;
        }
      )
      this.createLoadingDialog(spinnerMessage);

      this.leaveGroup(function callback(result) {
        if (result == 'success') {
          // dismiss the loading dialog
          that.dismissLoadingDialog();
          that.openPopupConfirmation('group-left');
        } else if (result == 'error') {
          // dismiss the loading dialog
          that.dismissLoadingDialog();
          that.openPopupConfirmation('cannot-leave-group');
        }
      });
    } else if (action === 'close') {
      this.closeConversation(this.conversationWith);
    }
  }

  /** */




  // create a new attributes map without 'client', 'departmentId', 'departmentName', 'sourcePage', 'userEmail', 'userFullname'
  private createCustomAttributesMap(attributes) {
    var tempMap = [];
    // perform a deep copy of the attributes item.
    // it prevents the privacy leak issue
    var temp = JSON.parse(JSON.stringify(attributes));
    // remove 'client'
    if (temp && temp['client']) delete temp['client'];
    // remove 'departmentId'
    if (temp && temp['departmentId']) delete temp['departmentId'];
    // remove 'departmentName'
    if (temp && temp['departmentName']) delete temp['departmentName'];
    // remove 'sourcePage'
    if (temp && temp['sourcePage']) delete temp['sourcePage'];
    // remove 'userEmail'
    if (temp && temp['userEmail']) delete temp['userEmail'];
    // remove 'userFullname'
    if (temp && temp['userFullname']) delete temp['userFullname'];

    if (temp && temp['senderAuthInfo']) delete temp['senderAuthInfo'];

    // add the remaining keys to the customAttributes array
    for (var key in temp) {
      if (temp.hasOwnProperty(key)) {
        var val = temp[key];
        // create the array item
        var item = {
          "key": key,
          "value": val
        }

        // add the item to the custom attributes array
        tempMap.push(item);
      }
    }
    this.customAttributes = tempMap;
  }








  // subscription on conversation changes
  subscribeConversationListener: any = (snapshot) => {
    console.log('InfoConversationPage::subscribeConversationListener');
    var that = this;
    console.log("InfoConversationPage::subscribeConversationListener::snapshot:", snapshot.ref.toString());
    if (snapshot.val()) {
      console.log("InfoConversationPage::subscribeConversationListener::snapshotVal:", snapshot.val())
      // conversation exists within conversation list
      that.conversationEnabled = true;
    } else {
      // conversation not exists within conversation list
      that.conversationEnabled = false;
    }
    console.log("InfoConversationPage::subscribeConversationListener::conversationEnabled:", this.conversationEnabled);
  }











  /** 
   * 
  */
  userIsOnline(uid) {
    const keySubscription = 'statusUser:online-' + uid;
    this.events.subscribe(keySubscription, this.callbackUserIsOnline);
    let isNewSubscription = this.addSubscription(keySubscription);
    if (isNewSubscription) {
      this.chatPresenceHandler.userIsOnline(uid);
    }
  }
  /**
   * on subscribe stato utente con cui si conversa ONLINE
   */
  callbackUserIsOnline: any = (uid, status) => {
    // Update status member

    if (this.channelType === TYPE_GROUP) {
      for (var i = 0; i < this.listMembers.length; i++) {
        const member = this.listMembers[i];
        if(uid == this.currentUserDetail.uid) {
          member.online = true;
          break;
        } else if (member.uid === uid) {
          member.online = status;
          console.log("----->ONLINE: ", member.uid, uid, member.online);
          break;
        }
      }
    } else {
      if(uid !== this.currentUserDetail.uid) {
        this.online = status;
        if (status == false) {
          this.lastOnlineForUser(this.conversationWith);
        }
      } 
    }
  }

  lastOnlineForUser(uid) {
    const keySubscription = 'lastConnectionDate-' + uid;
    this.events.subscribe(keySubscription, this.callbackLastOnlineForUser);
    let isNewSubscription = this.addSubscription(keySubscription);
    if (isNewSubscription) {
      console.log("subscribe::lastConnectionDate");
      this.chatPresenceHandler.lastOnlineForUser(uid);
    }
  }

  callbackLastOnlineForUser: any = (uid, lastConnectionDate) => {
    console.log("callbackLastOnlineForUser::", lastConnectionDate);
    this.lastConnectionDate = lastConnectionDate;
  }




  /**
  * subscribe to node membersInfo (list Verified Member)
  * quando mi restituisce un memberinfo lo aggiorno o aggiungo in members[]
  * 
  */
  checkVerifiedMembers(uid) {
    // DISTRUGGILA ALL'USCITA!!!!!
    console.log("checkVerifiedMembers");
    const keySubscription = 'callbackCheckVerifiedMembers-' + uid;
    if (this.addSubscription(keySubscription)) {
      this.events.subscribe(keySubscription, this.callbackCheckVerifiedMembers);
      this.groupService.loadMembersInfo(this.conversationWith, this.tenant, uid);
    }
  }


  /**
   * verifico se il membro è presente e aggiorno
   * altrimenti aggiungo
   */
  callbackCheckVerifiedMembers: any = (snapshot) => {
    console.log("callbackCheckVerifiedMembers", snapshot);
    this.listMembers.forEach(member => {
      if (snapshot.hasChild(member.uid)) {
        console.log("CHECKED", member.uid);
        member.checked = true;
      } else {
        console.log("UNCHECKED", member.uid);
        member.checked = false;
      }
    });

    // for (var i = 0; i < this.listMembers.length; i++) {
    //   const member = this.listMembers[i];
    //   if (member.uid === uid) {
    //     member.checked = true;
    //     console.log("----->VERIFIATO: ", member.uid, uid, member.checked);
    //   }
    // }

  }



  /** */
  arrayDepartments(departments): any[] {
    // console.log('departments:::: ', departments);
    let arrayDepartments = [];
    const departmentsStr = JSON.stringify(departments);
    JSON.parse(departmentsStr, (key, value) => {
      arrayDepartments.push(value);
    });
    return arrayDepartments.slice(0, -1);
  }




  //// ACTIONS ////
  /** */
  leaveGroup(callback) {
    // var spinnerMessage;
    // this.translate.get('LEAVING_GROUP_SPINNER_MSG').subscribe(
    //   value => {
    //     spinnerMessage = value;
    //   }
    // );

    // this.loadingDialog = createLoading(this.loadingCtrl, spinnerMessage);
    // this.loadingDialog.present();

    const uidUser = this.chatManager.getLoggedUser().uid; //'U4HL3GWjBsd8zLX4Vva0s7W2FN92';
    const uidGroup = this.conversationWith;//'support-group-L5Kb42X1MaM71fGgL66';
    this.groupService.leaveAGroup(uidGroup, uidUser, function (response, error) {
      if (error) {
        console.error('closeGroup ERROR MESSAGE', error);
        callback('error', error);
      }
      else {
        callback('success', response);
      }
    });
    // this.groupService.leaveAGroup(uidGroup, uidUser)
    //   .subscribe(
    //     response => {
    //       console.log('leaveGroup OK sender ::::', response);
    //       //this.dismissLoadingDialog();
    //       callback('success');
    //     },
    //     errMsg => {
    //       //this.dismissLoadingDialog();
    //       console.log('leaveGroup ERROR MESSAGE', errMsg);
    //       callback('error');
    //     },
    //     () => {
    //       console.log('leaveGroup API ERROR NESSUNO');
    //     }
    //   );
  }

  /** */
  closeGroup(callback) {
    const uidGroup = this.conversationWith;//'support-group-L5Kb42X1MaM71fGgL66';
    var that = this;
    this.groupService.closeGroup(uidGroup, function (response, error) {
      if (error) {
        console.error('closeGroup ERROR MESSAGE', error);
        callback('error', error);
      }
      else {
        callback('success', response);
      }
    });
    // this.groupService.closeGroup(uidGroup)
    // .subscribe(
    //   response => {
    //     // console.log('OK closeGroup ::::', response);
    //     // this.loading.dismiss();
    //     // this.dismissLoading();
    //     callback('success');
    //   },
    //   errMsg => {
    //     // this.dismissLoading();
    //     console.error('closeGroup ERROR MESSAGE', errMsg);
    //     // this.loading.dismiss();
    //     callback('error');
    //   },
    //   () => {
    //     // console.log('closeGroup API ERROR NESSUNO');
    //   }
    // );
  }

  /** */
  // setVideoChat() {
  //   // setto url 
  //   const url = environment.URL_VIDEO_CHAT + '?groupId=' + this.groupDetail.uid + '&popup=true';
  //   // this.events.publish('openVideoChat', url);
  //   this.openPopupConfirmation('video-chat');
  // }

  // getUrlCreaTicket() {
  //   // setto url 
  //   return environment.URL_TICKET_CHAT;
  //   //const url = URL_TICKET_CHAT + '&popup=true';
  //   //this.events.publish('openVideoChat', url);
  // }


  /**
   * 
   * @param action 
   */
  openPopupConfirmation(action) {
    // console.log("openPopupConfirmation");
    //debugger;
    let alertTitle = '';
    let alertMessage = '';
    this.translate.get('ALERT_TITLE').subscribe(
      value => {
        alertTitle = value;
      }
    )
    var onlyOkButton = false;
    if (action === 'leave') {
      this.translate.get('LEAVE_ALERT_MSG').subscribe(
        value => {
          alertMessage = value;
        }
      )
      onlyOkButton = false;
    } else if (action === 'group-left') {
      this.translate.get('CONVERSATION_LEFT_ALERT_MSG').subscribe(
        value => {
          alertMessage = value;
        }
      )
      onlyOkButton = true;
    } else if (action === 'cannot-leave-group') {
      this.translate.get('CANNOT_LEAVE_GROUP_ALERT_MSG').subscribe(
        value => {
          alertMessage = value;
        }
      )
      onlyOkButton = false;
    } else if (action === 'close') {
      this.translate.get('CLOSE_ALERT_MSG').subscribe(
        value => {
          alertMessage = value;
        }
      )
      onlyOkButton = false;
    } else if (action === 'video-chat') {
      this.translate.get('VIDEOCHAT_ALERT_MSG').subscribe(
        value => {
          alertMessage = value;
        }
      )
      onlyOkButton = false;
    }
    // console.log("onlyOkButton", onlyOkButton);
    this.confirmDialog = createConfirm(this.translate, this.alertCtrl, this.events, alertTitle, alertMessage, action, onlyOkButton);
    this.confirmDialog.present();
  }

  /** */
  isSupportGroup() {
    //debugger;
    return this.groupService.isSupportGroup(this.groupDetail.uid);
    // let uid = this.groupDetail.uid;
    // if(uid.indexOf(TYPE_SUPPORT_GROUP) === 0 ){
    //   return true;
    // }
    // return false;
  }

  private createLoadingDialog(message) {
    this.loadingDialog = createLoading(this.loadingCtrl, message);
    this.loadingDialog.present();
  }

  private dismissLoadingDialog() {
    if (this.loadingDialog) {
      this.loadingDialog.dismiss();
      this.loadingDialog = null;
    }
  }

  private dismissConfirmDialog() {
    if (this.confirmDialog) {
      this.confirmDialog.dismiss();
      this.confirmDialog = null;
    }
  }

  private closeConversation(conversationId) {
    console.log("InfoConversationPage::closeConversation::conversationId", conversationId);
    var isSupportConversation = conversationId.startsWith("support-group");
    if (!isSupportConversation) {
      // console.log("InfoConversationPage::closeConversation:: is not a support group");
      this.deleteConversation(conversationId, function (result, data) {
        if (result === 'success') {
          console.log("InfoConversationPage::closeConversation::deleteConversation::OK", data);
        } else if (result === 'error') {
          console.log("InfoConversationPage::closeConversation::deleteConversation::error", data);
        }
      });
      // https://github.com/chat21/chat21-cloud-functions/blob/master/docs/api.md#delete-a-conversation
    } else {
      // console.log("InfoConversationPage::closeConversation::closeConversation:: is a support group");

      // the conversationId is:
      // - the recipientId if it is a direct conversation;
      // - the groupId if it is a group conversation;
      // the groupId can reference:
      // - a normal group;
      // - a support  group if it starts with "support-group"
      this.closeSupportGroup(conversationId, function (result, data) {
        if (result === 'success') {
          // console.log("InfoConversationPage::closeConversation::closeSupportGroup::response", data);
        } else if (result === 'error') {
          console.log("InfoConversationPage::closeConversation::closeSupportGroup::error", data);
        }
      });
    }
  }

  // close the support group
  // more details availables at 
  // https://github.com/chat21/chat21-cloud-functions/blob/master/docs/api.md#close-support-group
  private closeSupportGroup(groupId, callback) {

    var that = this;

    // BEGIN -  REMOVE FROM LOCAL MEMORY 
    // console.log("performClosingConversation::conversations::BEFORE", JSON.stringify(this.conversationsHandler.conversations) )
    this.conversationsHandler.removeByUid(groupId); // remove the item 
    // this.conversations = this.conversationsHandler.conversations; // update conversations
    // console.log("performClosingConversation::conversations::AFTER", JSON.stringify(this.conversationsHandler.conversations))
    // END -  REMOVE FROM LOCAL MEMORY 

    // BEGIN - REMOVE FROM REMOTE 
    //set the conversation from the isConversationClosingMap that is waiting to be closed
    this.tiledeskConversationProvider.setClosingConversation(groupId, true);

    this.groupService.closeGroup(groupId, function (response, error) {
      if (error) {
        // the conversation closing failed: restore the conversation with 
        // conversationId status to false within the isConversationClosingMap
        that.tiledeskConversationProvider.setClosingConversation(groupId, false);
        callback('error', error);
      }
      else {
        callback('success', response);
      }
    });

    // this.groupService.closeGroup(groupId)
    //   .subscribe(response => {
    //     callback('success', response);
    //   }, errMsg => {
    //     // the conversation closing failed: restore the conversation with 
    //     // conversationId status to false within the isConversationClosingMap
    //     that.tiledeskConversationProvider.setClosingConversation(groupId, false);

    //     callback('error', errMsg);
    //   }, () => {
    //     // console.log("InfoConversationPage::closeSupportGroup::completition");
    //   });
    // // END - REMOVE FROM REMOTE 

    // when a conversations is closed shows a placeholder background
    if (groupId === that.conversationWith) {
      that.navProxy.pushDetail(PlaceholderPage, {});
    }
  }

  // delete a conversation form the personal timeline
  // more details availables at 
  // https://github.com/chat21/chat21-cloud-functions/blob/master/docs/api.md#delete-a-conversation
  private deleteConversation(conversationId, callback) {
    // console.log("InfoConversationPage::deleteConversation::conversationId", conversationId);

    var that = this;

    // END - REMOVE FROM LOCAL MEMORY 
    // console.log("deleteConversation::conversations::BEFORE", JSON.stringify(this.conversationsHandler.conversations))
    this.conversationsHandler.removeByUid(conversationId); // remove the item 
    // this.conversations = this.conversationsHandler.conversations; // update conversations
    // console.log("deleteConversation::conversations::AFTER", JSON.stringify(this.conversationsHandler.conversations))
    // END - REMOVE FROM LOCAL MEMORY 

    // BEGIN - REMOVE FROM REMOTE 
    //set the conversation from the isConversationClosingMap that is waiting to be closed
    this.tiledeskConversationProvider.setClosingConversation(conversationId, true);

    this.tiledeskConversationProvider.deleteConversation(conversationId, function (response, error) {
      if (error) {
        that.tiledeskConversationProvider.setClosingConversation(conversationId, false);
        callback('error', error);
      }
      else {
        callback('success', response);
      }
    });

    // this.tiledeskConversationProvider.deleteConversation(conversationId)
    //   .subscribe(response => {
    //     callback('success', response);
    //   }, errMsg => {
    //     // the conversation closing failed: restore the conversation with
    //     // conversationId status to false within the isConversationClosingMap
    //     that.tiledeskConversationProvider.setClosingConversation(conversationId, false);
    //     callback('error', errMsg);
    //   }, () => {
    //     // console.log("InfoConversationPage::deleteConversation::completition");
    //   });
    // // END - REMOVE FROM REMOTE 

    // when a conversations is closed shows a placeholder background
    if (conversationId === that.conversationWith) {
      that.navProxy.pushDetail(PlaceholderPage, {});
    }
  }

  private existsInArray(array: ConversationModel[], uid): boolean {
    var index = array.map(function (o) { return o.uid; }).indexOf(uid);

    //  console.log('echouid', uid);
    //  console.log('echoindex', index);

    return index > -1;

  }


  onCloseInfoPage() {
    this.eventClose.emit();
  }

  ngOnDestroy() {
    console.log("ngOnDestroy");
    this.unsubscribeAll();
  }

  sendMail() {
    const url = this.appConfig.getConfig().CHAT_SEND_BY_EMAIL_LINK + this.conversationSelected.uid + '/messages.html';
    window.open(url, '_blank', 'location=yes');
  }

  openInfoUser(member) {
    console.log("openInfoUser", member);
    this.eventOpenInfoUser.emit(member);
  }


  openUserRequest() {
    // this.projectId = '5b55e806c93dde00143163dd';
    // "https://support.tiledesk.com/dashboard/#/project/5af02d8f705ac600147f0cbb/request/support-group-LEOsofmVWYtljdxTf3c/messages";
    // var url = "https://support.tiledesk.com/dashboard/#/project/" + this.attributes.projectId + "/request/" + this.conversationWith + "/messages";
    console.log('openUserDetail this.attributes :', this.attributes);


    // -------------------------------------------------------------------------------------------
    // @ PROD v1
    // -------------------------------------------------------------------------------------------
    // var url = environment.URL_PROJECT_ID + this.attributes.projectId + "/request/" + this.conversationWith + "/messages";

    // -------------------------------------------------------------------------------------------
    // @ PRE
    // -------------------------------------------------------------------------------------------
    
    var url = this.appConfig.getConfig().DASHBOARD_URL + "#/project/" + this.attributes.projectId + "/wsrequest/" + this.conversationWith + "/messages";

    console.log('openUserDetail:', url);
    window.open(url, '_blank');
    //https://support.tiledesk.com/dashboard/#/project/5b55e806c93dde00143163dd/contact/5bf6705275a5a40015327b91
  }



  openProjectHome() {
    // this.projectId = '5b55e806c93dde00143163dd';
    // "https://support.tiledesk.com/dashboard/#/project/5af02d8f705ac600147f0cbb/request/support-group-LEOsofmVWYtljdxTf3c/messages";
    // var url = "https://support.tiledesk.com/dashboard/#/project/" + this.attributes.projectId + "/home/";
    var url = this.appConfig.getConfig().DASHBOARD_URL + "#/project/" + this.attributes.projectId + "/home/";

    console.log('openProjectHome:', url);
    window.open(url, '_blank');
    //https://support.tiledesk.com/dashboard/#/project/5b55e806c93dde00143163dd/contact/5bf6705275a5a40015327b91
  }

  openInfoAdvancedPage() {
    var advancedAttributes = []
    var item: any = {}
    if (this.channelType == TYPE_GROUP) {
      item = { "key": "ID_CONVERSATION", "value": this.groupDetail.uid }
      advancedAttributes.push(item)
      item = { "key": "LABEL_CREATED_THE", "value": this.groupDetail.createdOn }
      advancedAttributes.push(item)
    } else {
      item = { "key": "ID_CONVERSATION", "value": this.userDetail.uid }
      advancedAttributes.push(item)
    }

    // advancedAttributes['createdOn'] = this.groupDetail.createdOn
    this.customAttributes.forEach(attr => {
      //advancedAttributes[attr.key] = attr.value
      item = { "key": attr.key, "value": attr.value }
      advancedAttributes.push(item)
    });
    console.log("advancedAttributes", advancedAttributes);
    this.eventOpenInfoAdvanced.emit(advancedAttributes);
  }
  /**
   * 
   */
  addSubscription(key) {
    console.log("addSubscription--->", key, this.subscriptions);
    if (!isExistInArray(this.subscriptions, key)) {
      console.log("addSubscription: TRUE");
      this.subscriptions.push(key);
      return true;
    }
    console.log("addSubscription: FALSE");
    return false;
  }

  /**
   * unsubscribe all subscribe events
   */
  unsubscribeAll() {
    this.subscriptions.forEach((key) => {
      console.log("unsubscribe:", key);
      this.events.unsubscribe(key, null);
    });
    this.groupService.onDisconnectMembersInfo();
    this.groupService.onDisconnectLoadGroupDetail();
  }
  // ----------------------------------------- //

  isExistUidUserAuthenticatedInMembers() {
    if (this.signInProvider === 'custom' && this.uidUserAuthenticated && this.groupDetail) {
      //console.log('uidUserAuthenticated',this.uidUserAuthenticated);
      return isExistInArray(this.groupDetail.members, this.uidUserAuthenticated);
    }
    return false;
  }


}
