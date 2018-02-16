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

// utils
import { TYPE_GROUP, SYSTEM, URL_NO_IMAGE, LABEL_NOICON } from '../../utils/constants';
import { urlify } from '../../utils/utils';

/**
 * Generated class for the InfoConversationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


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

  constructor(
    public events: Events,
    public chatManager: ChatManager,
    public userService: UserService,
    public groupService: GroupService,
    public upSvc: UploadService,
    public zone: NgZone
  ) {
    console.log('InfoConversationPage');
    this.profileYourself = false;
    this.online = false; 
  }

  ngOnInit() {
    this.initialize();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad InfoConversationPage');
  }

  initialize(){
    this.profileYourself = false;
    this.currentUserDetail = this.chatManager.getLoggedUser();
    this.userDetail = new UserModel('', '', '', '', '', '');
    this.groupDetail = new GroupModel('', 0, '', [], '', '');
    this.setSubscriptions();
    console.log('this.currentUserDetail',this.currentUserDetail)
  }

  selectUserDetail(){
    if(this.uidSelected && this.uidSelected === this.currentUserDetail.uid){
      this.profileYourself = true;
      this.userDetail = this.currentUserDetail;
      this.displayImage(this.uidSelected);
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

  setSubscriptions(){
    this.events.subscribe('onUidSelected', this.subcribeUidUserSelected);
    this.events.subscribe('changeStatusUserSelected', (lastConnectionDate, online) => {
      this.online = online;
      this.lastConnectionDate = lastConnectionDate;
      console.log('changeStatusUserSelected', this.online, this.lastConnectionDate);
    });
    this.events.subscribe('loadUserDetail:complete', userDetail => {
      this.userDetail = userDetail;
      if(!userDetail.imageurl){
        this.userDetail.imageurl = URL_NO_IMAGE;
      }
      this.displayImage(this.userDetail.uid);
      console.log('loadUserDetail:complete', this.userDetail);
    });
    this.events.subscribe('loadGroupDetail:complete', groupDetail => {
      this.groupDetail = groupDetail;
      if(!groupDetail.iconURL || groupDetail.iconURL === LABEL_NOICON){
        this.groupDetail.iconURL = URL_NO_IMAGE;
      }
      this.members = this.getListMembers(groupDetail.members);
      this.displayImage(this.groupDetail.uid);
      console.log('loadGroupDetail:complete', this.members);
    });
  }

  subcribeUidUserSelected: any = (uidUserSelected, channel_type, attributes)  => {
    console.log('onUidSelected', uidUserSelected, channel_type);
    this.uidSelected = uidUserSelected;
    this.channel_type = channel_type;
    if(attributes){
      this.attributes = attributes;
      this.attributesClient = attributes.client;
      this.attributesSourcePage = urlify(attributes.sourcePage);
      this.attributesDepartments = this.arrayDepartments(attributes.departments).join(", ");
    }
    this.selectUserDetail();
  };
  /**
   * carico url immagine profilo passando id utente
   */
  displayImage(uidContact){
    const that = this;
    this.upSvc.display(uidContact)
    .then((url) => {
      that.zone.run(() => {
        if(that.profileYourself){
          that.currentUserDetail.imageurl = url;
        }else{
          that.userDetail.imageurl = url;
        }
      });
    })
    .catch((error)=>{
      // console.log("error::: ",error);
    });
  }


  getListMembers(members): UserModel[]{ 
    let arrayMembers = [];
    members.forEach(member => {
      console.log("loadUserDetail: ", member);
      if (member.trim() !== '' && member.trim() !== SYSTEM) {
        this.userService.getUserDetail(member)
        .then(function(snapshot) {
          let userDetail = new UserModel(snapshot.key, '', '', snapshot.key, '', '');        
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
            arrayMembers.push(userDetail);
          }
        })
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
