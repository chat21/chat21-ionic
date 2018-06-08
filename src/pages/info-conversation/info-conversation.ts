import { Component, NgZone } from '@angular/core';
import { AlertController, Events, LoadingController} from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';

// models
import { UserModel } from '../../models/user';
import { GroupModel } from '../../models/group';

// services
import { UploadService } from '../../providers/upload-service/upload-service';
import { UserService } from '../../providers/user/user';
import { GroupService } from '../../providers/group/group';
import { ChatManager } from '../../providers/chat-manager/chat-manager';

import { ChatConversationHandler } from '../../providers/chat-conversation-handler';

// utils
import { URL_TICKET_CHAT, URL_SEND_BY_EMAIL, URL_VIDEO_CHAT, TYPE_SUPPORT_GROUP, LABEL_ANNULLA, LABEL_ACTIVE_NOW, TYPE_GROUP, SYSTEM, URL_NO_IMAGE, LABEL_NOICON } from '../../utils/constants';
import { getFormatData, showConfirm, urlify, isExistInArray } from '../../utils/utils';


@Component({
  selector: 'page-info-conversation',
  templateUrl: 'info-conversation.html',
})
export class InfoConversationPage {

  public uidSelected: string;
  public channel_type: string;
  public userDetail: UserModel;
  public groupDetail: GroupModel;
  public members: UserModel[];
  public currentUserDetail: UserModel;
  public profileYourself: boolean;
  public attributes: any = {};
  public attributesClient: string = '';
  public attributesSourcePage: string = '';
  public attributesDepartments: string = '';
  public online: boolean;
  public lastConnectionDate: string;
  public conversationEnabled: boolean;

  public TYPE_GROUP = TYPE_GROUP;
  public LABEL_ACTIVE_NOW = LABEL_ACTIVE_NOW;
  public URL_SEND_BY_EMAIL = URL_SEND_BY_EMAIL;
  public URL_VIDEO_CHAT = URL_VIDEO_CHAT;

  private loading;
  

  constructor(
    public events: Events,
    public chatManager: ChatManager,
    public userService: UserService,
    public groupService: GroupService,
    public upSvc: UploadService,
    public zone: NgZone,
    public conversationHandler: ChatConversationHandler,
    public alertCtrl: AlertController,
    public translate: TranslateService,
    private loadingCtrl: LoadingController, 

  ) {
    this.profileYourself = false;
    this.online = false; 
    this.events.subscribe('closeDetailConversation', this.closeDetailConversation);
  }

  ngOnInit() {
    this.initialize();
    console.log('InfoConversationPage ngOnInit');
  }

  /**
   * quando esco dalla pagina distruggo i subscribe
   */
  ionViewWillLeave() {
    // nn passa mai di qui!!!!
    console.log('InfoConversationPage ionViewWillLeave');
    //this.unsubscribeInfoConversation();
    
  }
  
  initialize(){
    this.profileYourself = false;
    this.currentUserDetail = this.chatManager.getLoggedUser();
    this.userDetail = new UserModel('', '', '', '', '', '');
    this.groupDetail = new GroupModel('', 0, '', [], '', '');
    this.setSubscriptions();
  }

  /** SUBSCRIPTIONS */
  setSubscriptions(){
    this.events.subscribe('onOpenInfoConversation', this.subcribeOnOpenInfoConversation);
    this.events.subscribe('changeStatusUserSelected', this.subcribeChangeStatusUserSelected);
    // this.events.subscribe('loadUserDetail:complete', this.subcribeLoadUserDetail);
    // this.events.subscribe('loadGroupDetail:complete', this.subcribeLoadGroupDetail);
    this.events.subscribe('PopupConfirmation', this.subcribePopupConfirmation);
    console.log('this.conversationHandler.listSubsriptions',this.conversationHandler.listSubsriptions);
  }

  /**  */
  subcribePopupConfirmation: any = (resp, action) => {
    if(resp === LABEL_ANNULLA) { return; }

    if(action === 'leave'){
      this.leaveGroup();
    } else if(action === 'close') {
      var that = this;
      this.closeGroup(function callback(result) {
        if(result == 'success') {
          that.openPopupConfirmation('conversation-closed');
        } else if(result == 'error') {
          that.openPopupConfirmation('cannot-close-conversation');
        }
      });
    }
  }

  /** */
  subcribeOnOpenInfoConversation: any = (openInfoConversation, uidUserSelected, channel_type, attributes)  => {
    // se openInfoConversation === false il pannello è chiuso!
    if(!openInfoConversation){ return; } 
    this.uidSelected = uidUserSelected;
    this.channel_type = channel_type;
    this.attributes = attributes;
    if(attributes){
      this.attributesClient = (attributes.client)?attributes.client:'';
      this.attributesSourcePage = (attributes.sourcePage)?urlify(attributes.sourcePage):'';
      //this.attributesDepartments = (attributes.departments)?this.arrayDepartments(attributes.departments).join(", "):'';
    }
    this.populateDetail();
  };

  /** */
  subcribeChangeStatusUserSelected: any = (lastConnectionDate, online) => {
    this.online = online;
    this.lastConnectionDate = lastConnectionDate;
  };



  /**
   * unsubscribe all subscribe events
   */
  closeDetailConversation: any = e => {
    console.log('UNSUBSCRIBE -> unsubescribeAll', this.events);
    this.events.unsubscribe('onOpenInfoConversation', null);
    this.events.unsubscribe('changeStatusUserSelected', null);
    // this.events.unsubscribe('loadUserDetail:complete', null);
    // this.events.unsubscribe('loadGroupDetail:complete', null);
    this.events.unsubscribe('PopupConfirmation', null);
  }
  // ----------------------------------------- //


  /** selectUserDetail
   * se uid conversazione esiste popolo:
   * 1 - dettaglio current user
   * 2 - dettaglio gruppo
   * 3 - dettaglio user
  */
  populateDetail(){
    // debugger;
    const that = this;
    if(!this.uidSelected){
      return;
    } else if(this.uidSelected === this.currentUserDetail.uid){
      this.profileYourself = true;
      this.userDetail = this.currentUserDetail;
    } else if(this.channel_type === TYPE_GROUP) {
      this.profileYourself = false;
      this.members = [];
      //this.groupDetail = new GroupModel(this.uidSelected, 0, '', [], '', '');
      this.groupService.loadGroupDetail(this.currentUserDetail.uid, this.uidSelected)
      .then(function(snapshot) { 
        //this.groupDetail = new GroupModel(snapshot.key, 0, '', [], '', '');        
        if (snapshot.val()){
          that.setDetailGroup(snapshot);
        }
      })
      .catch(function(err) {
        console.log('Unable to get permission to notify.', err);
      });
    } else {
      this.profileYourself = false;
      //this.userDetail = new UserModel(this.uidSelected, '', '', '', '', '');
      this.userService.loadUserDetail(this.uidSelected)
      .then(function(snapshot) { 
        console.log('snapshot:: ', snapshot.val());
        if (snapshot.val()){
          that.setDetailUser(snapshot);
        }
      })
      .catch(function(err) {
        console.log('Unable to get permission to notify.', err);
      });
    } 
  }

  setDetailUser(snapshot){
    //let userDetail = new UserModel(snapshot.key, '', '', snapshot.key, '', '');        
    const user = snapshot.val();
    const fullname = user.firstname+" "+user.lastname;  
    this.userDetail = new UserModel(
      snapshot.key, 
      user.email, 
      user.firstname, 
      user.lastname, 
      fullname.trim(), 
      user.imageurl
    );        
  }


  setDetailGroup(snapshot){
    const group = snapshot.val();
    this.groupDetail = new GroupModel(
      snapshot.key, 
      getFormatData(group.createdOn), 
      group.iconURL,
      this.groupService.getUidMembers(group.members), 
      group.name, 
      group.owner
    );    
    if(!this.groupDetail.iconURL || this.groupDetail.iconURL === LABEL_NOICON){
      this.groupDetail.iconURL = URL_NO_IMAGE;
    }
    this.members = this.getListMembers(this.groupDetail.members);
    if(isExistInArray(this.groupDetail.members, this.currentUserDetail.uid)){
      this.conversationEnabled = true;
      //this.events.publish('conversationEnabled', true);
    } else {
      this.conversationEnabled = false;
      //this.events.publish('conversationEnabled', false);
    }
  }
  


  /** */
  getListMembers(members): UserModel[]{ 
    let arrayMembers = [];
    members.forEach(member => {
      console.log("loadUserDetail: ", member);
      let userDetail = new UserModel(member, '', '', member, '', URL_NO_IMAGE);
      if (member.trim() !== '' && member.trim() !== SYSTEM) {
        this.userService.getUserDetail(member)
        .then(function(snapshot) { 
          if (snapshot.val()){
            const user = snapshot.val();
            const fullname = user.firstname+" "+user.lastname;  
            let imageUrl =  URL_NO_IMAGE;
            if(user.imageurl && user.imageurl !== LABEL_NOICON){
              imageUrl = user.imageurl;
            }
            userDetail = new UserModel(
              snapshot.key, 
              user.email, 
              user.firstname, 
              user.lastname, 
              fullname.trim(), 
              imageUrl
            );  
            console.log("userDetail: ", userDetail)
          }
          console.log("---------------> : ", member);
          arrayMembers.push(userDetail);
        })
        .catch(function(err) {
          console.log('Unable to get permission to notify.', err);
        });
      }
    });
    return arrayMembers;
  }

  /** */
  arrayDepartments(departments): any[] {
    console.log('departments:::: ', departments);
    let arrayDepartments = [];
    const departmentsStr = JSON.stringify(departments);
    JSON.parse(departmentsStr, (key, value) => {
      arrayDepartments.push(value);
    });
    return arrayDepartments.slice(0, -1);
  }




  //// ACTIONS ////
  /** */
  leaveGroup(){
    this.conversationEnabled = false;
    this.events.publish('conversationEnabled', false);
    const uidUser = this.chatManager.getLoggedUser().uid; //'U4HL3GWjBsd8zLX4Vva0s7W2FN92';
    const uidGroup = this.uidSelected;//'support-group-L5Kb42X1MaM71fGgL66';
    this.groupService.leaveAGroup(uidGroup, uidUser)
    .subscribe(
      response => {
        console.log('leaveGroup OK sender ::::', response);
      },
      errMsg => {
        this.conversationEnabled = true;
        this.events.publish('conversationEnabled', true);
        console.log('leaveGroup ERROR MESSAGE', errMsg);
      },
      () => {
        console.log('leaveGroup API ERROR NESSUNO');
      }
    );
  }

  /** */
  closeGroup(callback) {
    var spinnerContent;
    this.translate.get('CLOSING_CONVERSATION_SPINNER_MSG').subscribe(
      value => {
        spinnerContent = value;
      }
    )
    this.loading = this.loadingCtrl.create({
      spinner: 'circles',
      content: spinnerContent,
    });
    this.loading.present();


    this.conversationEnabled = false;
    this.events.publish('conversationEnabled', false);
    const uidGroup = this.uidSelected;//'support-group-L5Kb42X1MaM71fGgL66';
    this.groupService.closeGroup(uidGroup)
    .subscribe(
      response => {
        console.log('OK closeGroup ::::', response);
        this.loading.dismiss();
        callback('success');
      },
      errMsg => {
        this.conversationEnabled = true;
        this.events.publish('conversationEnabled', true);
        console.log('closeGroup ERROR MESSAGE', errMsg);
        this.loading.dismiss();
        callback('error');
      },
      () => {
        console.log('closeGroup API ERROR NESSUNO');
      }
    );
  }

  /** */
  setVideoChat(){
    // setto url 
    const url = this.URL_VIDEO_CHAT+'?groupId='+this.groupDetail.uid+'&popup=true';
    this.events.publish('openVideoChat', url);
  }

  getUrlCreaTicket(){
    // setto url 
    return URL_TICKET_CHAT;
    //const url = URL_TICKET_CHAT + '&popup=true';
    //this.events.publish('openVideoChat', url);
  }


  /**
   * 
   * @param action 
   */
  openPopupConfirmation(action){
    console.log("openPopupConfirmation");
    
    //debugger;
    let alertTitle = '';
    let alertMessage = '';
    this.translate.get('ALERT_TITLE').subscribe(
      value => {
        alertTitle = value;
      }
    )

    var onlyOkButton = false;

    if(action === 'leave'){
      this.translate.get('LEAVE_ALERT_MSG').subscribe(
        value => {
          alertMessage = value;
        }
      )
      onlyOkButton = false;
    } else if(action === 'close'){
      this.translate.get('CLOSE_ALERT_MSG').subscribe(
        value => {
          alertMessage = value;
        }
      )
      onlyOkButton = false;
    } else if (action === 'conversation-closed') {
      this.translate.get('CONVERSATION_CLOSED_ALERT_MSG').subscribe(
        value => {
          alertMessage = value;
        }
      )
      onlyOkButton = true;
    } else if (action === 'cannot-close-conversation') {
      this.translate.get('CANNOT_CLOSE_CONVERSATION_ALERT_MSG').subscribe(
        value => {
          alertMessage = value;
        }
      )
      onlyOkButton = false;
    } 

    console.log("onlyOkButton", onlyOkButton);

    showConfirm(this.alertCtrl, this.events, alertTitle, alertMessage, action, onlyOkButton);
  }

  /** */
  isSupportGroup(){
    //debugger;
    return this.groupService.isSupportGroup(this.groupDetail.uid);
    // let uid = this.groupDetail.uid;
    // if(uid.indexOf(TYPE_SUPPORT_GROUP) === 0 ){
    //   return true;
    // }
    // return false;
  }
  


}
