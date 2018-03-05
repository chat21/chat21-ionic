import { Component, NgZone } from '@angular/core';
import { Events } from 'ionic-angular';

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
import { LABEL_ACTIVE_NOW, TYPE_GROUP, SYSTEM, URL_NO_IMAGE, LABEL_NOICON } from '../../utils/constants';
import { urlify } from '../../utils/utils';

@Component({
  selector: 'page-info-conversation',
  templateUrl: 'info-conversation.html',
})
export class InfoConversationPage {

  public uidSelected: string;
  public channel_type: string;
  public TYPE_GROUP: string = TYPE_GROUP;

  public userDetail: UserModel;
  public groupDetail: GroupModel;
  public members: UserModel[];
  public currentUserDetail: UserModel;
  public profileYourself: boolean;

  public attributes: any;
  public attributesClient: string = '';
  public attributesSourcePage: string = '';
  public attributesDepartments: string = '';

  public online: boolean;
  public lastConnectionDate: string;
  public LABEL_ACTIVE_NOW = LABEL_ACTIVE_NOW;

  //public conversationHandler: ChatConversationHandler;

  constructor(
    public events: Events,
    public chatManager: ChatManager,
    public userService: UserService,
    public groupService: GroupService,
    public upSvc: UploadService,
    public zone: NgZone,
    public conversationHandler: ChatConversationHandler
  ) {
    console.log('InfoConversationPage');
    this.profileYourself = false;
    this.online = false; 
    // indica quando eliminare la sottoscrizione, invocato dalla pg dettaglio conversazione appena entro!!!
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
    this.events.subscribe('onUidSelected', this.subcribeUidUserSelected);
    this.events.subscribe('changeStatusUserSelected', this.subcribeChangeStatusUserSelected);
    this.events.subscribe('loadUserDetail:complete', this.subcribeLoadUserDetail);
    this.events.subscribe('loadGroupDetail:complete', this.subcribeLoadGroupDetail);
    console.log('this.conversationHandler.listSubsriptions',this.conversationHandler.listSubsriptions);
  }

  subcribeUidUserSelected: any = (openInfoConversation, uidUserSelected, channel_type, attributes)  => {
    console.log('SUBSCRIBE -> onUidSelected', uidUserSelected, channel_type);
    // se sto chiudendo nn carico i dettagli utenti
    if(!openInfoConversation){
     // this.unsubscribeInfoConversation();
      return;
    } 
    this.uidSelected = uidUserSelected;
    this.channel_type = channel_type;
    if(attributes){
      // this.attributes = attributes;
      this.attributesClient = (attributes.client)?attributes.client:'';
      this.attributesSourcePage = (attributes.sourcePage)?urlify(attributes.sourcePage):'';
      this.attributesDepartments = (attributes.departments)?this.arrayDepartments(attributes.departments).join(", "):'';
    }
    this.selectUserDetail();
  };

  subcribeChangeStatusUserSelected: any = (lastConnectionDate, online) => {
    this.online = online;
    this.lastConnectionDate = lastConnectionDate;
    console.log('SUBSCRIBE -> changeStatusUserSelected', this.online, this.lastConnectionDate);
  };

  subcribeLoadUserDetail: any = userDetail => {
    this.userDetail = userDetail;
    if(!userDetail.imageurl){
      this.userDetail.imageurl = URL_NO_IMAGE;
    }
    //this.displayImage(this.userDetail.uid);
    console.log('SUBSCRIBE -> loadUserDetail:complete', this.userDetail);
  };

  subcribeLoadGroupDetail: any = groupDetail => {
    this.groupDetail = groupDetail;
    if(!groupDetail.iconURL || groupDetail.iconURL === LABEL_NOICON){
      this.groupDetail.iconURL = URL_NO_IMAGE;
    }
    //console.log('SUBSCRIBE -> getListMembers', groupDetail.members);
    this.members = this.getListMembers(groupDetail.members);
    //this.displayImage(this.groupDetail.uid);
    console.log('SUBSCRIBE -> loadGroupDetail:complete', groupDetail.members);
  };

  /**
   * unsubscribe all subscribe events
   */
  closeDetailConversation: any = e => {
    console.log('UNSUBSCRIBE -> unsubescribeAll', this.events);
    this.events.unsubscribe('onUidSelected', null);
    this.events.unsubscribe('changeStatusUserSelected', null);
    this.events.unsubscribe('loadUserDetail:complete', null);
    this.events.unsubscribe('loadGroupDetail:complete', null);
  }
  // ----------------------------------------- //


  selectUserDetail(){
    if(this.uidSelected && this.uidSelected === this.currentUserDetail.uid){
      this.profileYourself = true;
      this.userDetail = this.currentUserDetail;
      //this.displayImage(this.uidSelected);
    }
    else if(this.channel_type == TYPE_GROUP && this.uidSelected) {
      this.profileYourself = false;
      this.members = [];
      this.groupDetail = new GroupModel(this.uidSelected, 0, '', [], '', '');
      this.groupService.loadGroupDetail(this.currentUserDetail.uid, this.uidSelected);
    } else if(this.uidSelected) {
      this.profileYourself = false;
      this.userDetail = new UserModel(this.uidSelected, '', '', '', '', '');
      this.userService.loadUserDetail(this.uidSelected);
    } else {
      return;
    }
    console.log('this.uidUser',this.userDetail);
  }

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

  arrayDepartments(departments): any[] {
    console.log('departments:::: ', departments);
    let arrayDepartments = [];
    const departmentsStr = JSON.stringify(departments);
    JSON.parse(departmentsStr, (key, value) => {
      arrayDepartments.push(value);
    });
    return arrayDepartments.slice(0, -1);
  }

  leaveGroup(){
    const uidUser = this.chatManager.getLoggedUser().uid; //'U4HL3GWjBsd8zLX4Vva0s7W2FN92';
    const uidGroup = this.uidSelected;//'support-group-L5Kb42X1MaM71fGgL66';
    this.groupService.leaveAGroup(uidGroup, uidUser)
    .subscribe(
      response => {
        console.log('OK sender ::::', response);
      },
      errMsg => {
        console.log('httpSendRate ERROR MESSAGE', errMsg);
      },
      () => {
        console.log('API ERROR NESSUNO');
      }
    );
  }



}
