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
import { getFormatData, createConfirm, urlify, isExistInArray, createLoading } from '../../utils/utils';


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
  private customAttributes = []; 
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

  private loadingDialog : any;
  private confirmDialog : any;
  

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

    var that = this;

    if(action === 'leave') {
      // // dismiss the confirm dialog
      // this.dismissConfirmDialog();

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
    } else if(action === 'close') {
      // // dismiss the confirm dialog
      // this.dismissConfirmDialog();

      // create and show loading dialog
      var spinnerMessage;
      this.translate.get('CLOSING_CONVERSATION_SPINNER_MSG').subscribe(
        value => {
          spinnerMessage = value;
        }
      )
      this.createLoadingDialog(spinnerMessage);

      this.closeGroup(function callback(result) {
        if(result == 'success') {
          // dismiss the loading dialog
          that.dismissLoadingDialog();
          that.openPopupConfirmation('conversation-closed');
        } else if(result == 'error') {
          // dismiss the loading dialog
          that.dismissLoadingDialog();
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

      console.log("InfoConversationPage::subcribeOnOpenInfoConversation::attributes", attributes)

      this.attributesClient = (attributes.client)?attributes.client:'';
      this.attributesSourcePage = (attributes.sourcePage)?urlify(attributes.sourcePage):'';
      //this.attributesDepartments = (attributes.departments)?this.arrayDepartments(attributes.departments).join(", "):'';

      this.createCustomAttributesMap(attributes);
      // console.log("InfoConversationPage::subcribeOnOpenInfoConversation::attributes", attributes);
      console.log("InfoConversationPage::subcribeOnOpenInfoConversation::customAttributes", this.customAttributes);
     
    }
    this.populateDetail();
  };

  // create a new attributes map without 'client', 'departmentId', 'departmentName', 'sourcePage', 'userEmail', 'userName'
  private createCustomAttributesMap(attributes) {
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
    // remove 'userName'
    if (temp && temp['userName']) delete temp['userName'];

    // add the remaining keys to the customAttributes array
    for (var key in temp) {
      if (temp.hasOwnProperty(key)) {
        var val = temp[key];
    
        // create the array item
        var item = {
          "key": key, 
          "value" : val
        }

        // add the item to the custom attributes array
        this.customAttributes.push(item);
      }
    }
  }

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
    // console.log(this.groupDetail.members.length);
    console.log("InfoConversationPage::setDetailGroup::members", this.members);


    // console.log("setDetailGroup.groupDetail.members", this.groupDetail.members);
    // console.log("setDetailGroup.groupDetail.members.length", this.members.length);

    if (!isExistInArray(this.groupDetail.members, this.currentUserDetail.uid) || this.groupDetail.members.length <= 1 ){
      this.conversationEnabled = false;
      //this.events.publish('conversationEnabled', false);
    } else {
      this.conversationEnabled = true;
      //this.events.publish('conversationEnabled', true);
    }

    console.log("setDetailGroup.conversationEnabled", this.conversationEnabled);
  }
  


  /** */
  getListMembers(members): UserModel[]{ 
    console.log("InfoConversationPage::getListMembers::members", members);
    let arrayMembers = [];
    // var membersSize = 0;
    members.forEach(member => {
      console.log("InfoConversationPage::getListMembers::member", member);
      let userDetail = new UserModel(member, '', '', member, '', URL_NO_IMAGE);
      if (member.trim() !== '' && member.trim() !== SYSTEM) {
        this.userService.getUserDetail(member)
        .then(function(snapshot) { 
          console.log("InfoConversationPage::getListMembers::snapshot", snapshot);
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
            console.log("InfoConversationPage::getListMembers::userDetail", userDetail);
          }
          console.log("---------------> : ", member);
          arrayMembers.push(userDetail);
          // membersSize++;
        })
        .catch(function(err) {
          console.log('Unable to get permission to notify.', err);
        });
      }
    });

    // arrayMembers.length = membersSize; // fix the array size
    console.log("InfoConversationPage::getListMembers::arrayMembers", arrayMembers);
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
  leaveGroup(callback){
    // var spinnerMessage;
    // this.translate.get('LEAVING_GROUP_SPINNER_MSG').subscribe(
    //   value => {
    //     spinnerMessage = value;
    //   }
    // );
    
    // this.loadingDialog = createLoading(this.loadingCtrl, spinnerMessage);
    // this.loadingDialog.present();

    this.conversationEnabled = false;
    this.events.publish('conversationEnabled', false);
    const uidUser = this.chatManager.getLoggedUser().uid; //'U4HL3GWjBsd8zLX4Vva0s7W2FN92';
    const uidGroup = this.uidSelected;//'support-group-L5Kb42X1MaM71fGgL66';
    this.groupService.leaveAGroup(uidGroup, uidUser)
    .subscribe(
      response => {
        console.log('leaveGroup OK sender ::::', response);
        this.dismissLoadingDialog();
        callback('success');
      },
      errMsg => {
        this.dismissLoadingDialog();
        this.conversationEnabled = true;
        this.events.publish('conversationEnabled', true);
        console.log('leaveGroup ERROR MESSAGE', errMsg);
        callback('error');
      },
      () => {
        console.log('leaveGroup API ERROR NESSUNO');
      }
    );
  }

  /** */
  closeGroup(callback) {

    // var spinnerMessage;
    // this.translate.get('CLOSING_CONVERSATION_SPINNER_MSG').subscribe(
    //   value => {
    //     spinnerMessage = value;
    //   }
    // )
    // // this.loading = this.loadingCtrl.create({
    // //   spinner: 'circles',
    // //   content: spinnerMessage,
    // // });

    // this.loadingDialog = createLoading(this.loadingCtrl, spinnerMessage);
    // this.loadingDialog.present();

    this.conversationEnabled = false;
    this.events.publish('conversationEnabled', false);
    const uidGroup = this.uidSelected;//'support-group-L5Kb42X1MaM71fGgL66';
    this.groupService.closeGroup(uidGroup)
    .subscribe(
      response => {
        console.log('OK closeGroup ::::', response);
        // this.loading.dismiss();
        // this.dismissLoading();
        callback('success');
      },
      errMsg => {
        // this.dismissLoading();
        this.conversationEnabled = true;
        this.events.publish('conversationEnabled', true);
        console.log('closeGroup ERROR MESSAGE', errMsg);
        // this.loading.dismiss();
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

    if(action === 'leave'){
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
    }  else if(action === 'close'){
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

    // console.log("onlyOkButton", onlyOkButton);

    this.confirmDialog = createConfirm(this.alertCtrl, this.events, alertTitle, alertMessage, action, onlyOkButton);
    this.confirmDialog.present();
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
}
