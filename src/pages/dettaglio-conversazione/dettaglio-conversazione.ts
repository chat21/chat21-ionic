import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavParams, Content, Events, Platform } from 'ionic-angular';

// firebase
import * as firebase from 'firebase/app';
//import { AngularFireAuth } from 'angularfire2/auth';
import { FirebaseListObservable } from 'angularfire2/database';

// models
import { UserModel } from '../../models/user';
import { MessageModel } from '../../models/message';

// providers
import { UserService } from '../../providers/user/user';
import { MessageProvider } from '../../providers/message/message';
import { NavProxyService } from '../../providers/nav-proxy';
import { ChatPresenceHandler } from '../../providers/chat-presence-handler';

// pages
import { ListaConversazioniPage } from '../lista-conversazioni/lista-conversazioni';
import { _DetailPage } from '../_DetailPage';
import { ProfilePage } from '../profile/profile';


// utils
import { urlify, setLastDate, setHeaderDate } from '../../utils/utils';
import { PARENT_PAGE_USERS, MIN_HEIGHT_TEXTAREA, MSG_STATUS_FAILED,MSG_STATUS_SENDING, MSG_STATUS_SENT, MSG_STATUS_RECEIVED, MSG_STATUS_SEEN } from '../../utils/constants';

// directives
import { AutosizeDirective } from '../../directives/autosize/autosize';
/**
 * Generated class for the DettaglioConversazionePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */


@IonicPage()
@Component({
  selector: 'page-dettaglio-conversazione',
  templateUrl: 'dettaglio-conversazione.html',
})
export class DettaglioConversazionePage extends _DetailPage{
  @ViewChild(Content) content: Content;
  @ViewChild('messageTextArea') messageTextArea: ElementRef;
  //@ViewChild('messageTextArea') messageTextArea: ElementRef;   

  private parentPage: string;
  private scrollDirection: any = 'bottom';

  private firebaseMessages: FirebaseListObservable<any>;
  private messages: Array<MessageModel> = [];
  private conversationId: string;
  private uidSender: string;
  private uidReciver: string;
  private currentUser: UserModel;
  private userRecipient: UserModel;
  private online: boolean;
  private lastConnectionDate: string;
  private messageString: string;
  private style_message_welcome: boolean;

  constructor(
    public navParams: NavParams,
    public chatPresenceHandler: ChatPresenceHandler,
    public navProxy: NavProxyService,
    public messageProvider: MessageProvider,
    public userService: UserService,
    public events: Events,
    platform: Platform,
  ) {
    super();
    this.online = false;
    // recupero current user id
    //this.uidSender = navParams.get('uidSender');
    // platform.ready().then(() => {
    //   Keyboard.onKeyboardShow().subscribe(() => {
    //       document.body.classList.add('keyboard-is-open');
    //   });

    //   Keyboard.onKeyboardHide().subscribe(() => {
    //       document.body.classList.remove('keyboard-is-open');
    //   });
    // });

    let heightTest = "300px";
    // recupero id riciver
    this.uidReciver = navParams.get('uidReciver');

    // recupero parent page
    this.parentPage = navParams.get('parentPage');
  }

  ionViewDidEnter(){
    console.log('ionViewDidEnter **************', this.content);
    this.content.scrollDownOnLoad = true;
  }


  ngOnInit() {
    this.content.scrollDownOnLoad = true;
    // recupero current user id
    this.uidSender = firebase.auth().currentUser.uid;

    // recupero riciver user detail
    var that = this;
    const userFirebase = this.userService.setUserDetail(this.uidReciver);
    // userFirebase.then(function(snapshot) {
    //   const user = snapshot.val();
    //   const fullname = user.name+" "+user.lastname;
    //   const userDetails = new UserModel(user.uid, user.name, user.lastname, fullname, user.imageurl);
    //   that.userRecipient = userDetails;
    //   console.log("userDetails::::",that.userRecipient);
    // });
    userFirebase.subscribe(snapshot => {
      const user = snapshot.val();
      const fullname = user.name+" "+user.lastname;
      const userDetails = new UserModel(user.uid, user.name, user.lastname, fullname, user.imageurl);
      console.log("userDetails",userDetails);
      this.userRecipient = userDetails;
    });

    console.log('ngOnInit **************',this.uidSender, this.uidReciver);
    // setto conversationId
    this.conversationId = this.messageProvider.createConversationId(this.uidSender, this.uidReciver);
    // recupero current currentUserDetail
    this.currentUser = this.userService.getCurrentUserDetails();
    console.log('this.currentUser *************', this.currentUser);
    // recupero i messaggi della conversazione
    this.getMessages();
    console.log('this.getMessages *************');
    // recupero info status user reciver
    this.setupOnlineStatus();
    console.log('this.setupOnlineStatus *************');
    //controllo se vengo da users e 
    //imposto pagina elenco conversazioni nella pg di sx
    // if (this.parentPage && this.parentPage == PARENT_PAGE_USERS) {
    //   this.navProxy.setRootMaster(ListaConversazioniPage, {conversationId:this.conversationId});
    // }

    //Keyboard.disableScroll(true);
  }
  //// END functions of system ////

  //// START functions messages ////
  // get list messages
  getMessages(){
    console.log("uidSender:::uidReciver:: ",this.uidSender, this.uidReciver);
    // imposto array messaggi
    this.messages = [];
    this.firebaseMessages = this.messageProvider.loadListMeggages(this.uidReciver, this.uidSender);
    this.firebaseMessages.subscribe(snapshot => { 
      this.doScroll();
      this.messages = [];
      var lastDate: string = "";
      snapshot.forEach(item => {
        // aggiorno lo stato del messaggio come letto
        this.messageProvider.setStatusMessage(item);
        // imposto il giorno del messaggio per visualizzare o nascondere l'header data
        let calcolaData = setHeaderDate(item.timestamp, lastDate);
        if(calcolaData != null){
          lastDate = calcolaData;
        }
        // creo oggetto messaggio e lo aggiungo all'array dei messaggi
        const message = new MessageModel(item.conversationId, item.recipient, item.sender, item.sender_fullname, item.status, item.text, item.timestamp, calcolaData, item.type);
        this.messages.push(message);
      });  
      let lastMessage = this.messages.slice(-1)[0];
      console.log("aggiorno stato conversazione::",lastMessage);
      if(lastMessage){
        this.messageProvider.setStatusConversation(lastMessage);
      }
      
      //visualizzo div content_message_welcome
      this.style_message_welcome = true;
      console.log("this.content_message_welcome::",this.style_message_welcome);
    });
  }

  // Check if the user is the sender of the message.
  isSender(message) {
    return this.messageProvider.isSender(message);
  }

  // Send message
  sendMessage(msg) {
    //console.log("messageTextArea:: ",this.messageTextArea['_elementRef'].nativeElement.getElementsByTagName('textarea')[0].style);
    if (msg && msg.trim() != ''){
      this.messageTextArea['_elementRef'].nativeElement.getElementsByTagName('textarea')[0].style.height = MIN_HEIGHT_TEXTAREA+"px";
      //console.log("messageString:::firebaseMessages",msg, msg);
      this.messageString = urlify(msg);
      console.log("messageString:::firebaseMessages", this.messageString, this.currentUser);
      let now: Date = new Date();
      let timestamp = now.valueOf();
      
      //creo messaggio e lo aggiungo all'array
      //cambio lo stato da 0 a 1 e lo invio
      //quando lo ricevo cambio lo stato a 2
      if(this.firebaseMessages) {
          const message = {
              conversationId: this.conversationId,
              recipient: this.uidReciver,
              sender: this.uidSender,
              sender_fullname: this.currentUser.fullname,
              status: MSG_STATUS_SENT,
              text: this.messageString,
              timestamp: timestamp,
              type: 'text'
          };
          console.log('messaggio **************',message, this.messageProvider);
          this.messageProvider.createSenderConversation(message,this.currentUser,this.userRecipient);
          this.messageProvider.createReceiverConversation(message, this.currentUser, this.userRecipient);
          this.messageString = "";
          //console.log("000 firebaseMessage push",this.messageString, this.firebaseMessages);
          this.firebaseMessages.push(message);
          
          
          // aggiorno ListaConversazioniPage
          this.events.publish('setConversationSelected:change',this.conversationId);
          //this.navProxy.setRootMaster(ListaConversazioniPage, {conversationId:this.conversationId});
          //this.content.scrollToBottom();
      }
    }
    else {
      this.messageString = "";
    }
  }
  //// END functions messages ////


  //// START Scroll managemant functions ////
  // Scroll to bottom of page after a short delay.
  scrollBottom() {
    var that = this;
    //console.log('scrollBottom1 **************', that.content);
    setTimeout(function() {
      //console.log('scrollBottom2 **************', that.content._scroll);
      if(that.content._scroll){
        that.content.scrollToBottom(0);
      }
    }, 300);
  }
  // Scroll to top of the page after a short delay.
  scrollTop() {
    var that = this;
    setTimeout(function() {
      that.content.scrollToTop();
    }, 300);
  }
  // Scroll depending on the direction.
  doScroll() {
    //console.log('doScroll **************', this.scrollDirection);
    if (this.scrollDirection == 'bottom') {
      this.scrollBottom();
    } else if (this.scrollDirection == 'top') {
      this.scrollTop();
    }
  }
  //// END Scroll managemant functions ////


  //// START functions input message ////
  pressedOnKeyboard(event,messageString){
    messageString = messageString.replace(/(\r\n|\n|\r)/gm,"");
    console.log('pressedOnKeyboard ************** event:: ', event.code);
    if (event.inputType == "insertLineBreak" && event.data == null){
      return
    }
    if (messageString.trim() != ''){
      this.sendMessage(messageString);
    } else {
      this.messageString = "";
    }
  }
  //// END functions input message ////

  
  
  //// START functions user active ////
  // detect user active and get last on line date
  setupOnlineStatus(){
    const that = this;
    const onlineRef =  this.chatPresenceHandler.onlineRefForUser(this.uidReciver);
    //console.log("onlineRef1:",onlineRef, this.online);
    onlineRef.on("value", (child) => {
      //console.log("value: ======> ",child.val());
      if(child.val()){
        that.online = true;
      }
      else {
        that.online = false;
      }
    })
    // LAST ONLINE
    let lastOnlineRef = this.chatPresenceHandler.lastOnlineRefForUser(this.uidReciver);
    //this.last_online_ref_handle = this.onlineRef.subcribe(snapshot => {
    lastOnlineRef.on("value", (child) => {
      //console.log("value: ",child.val());
      if(child.val()){
        this.lastConnectionDate = this.getTimeLastConnection(child.val());
      }
    });
  }

  getTimeLastConnection(timestamp:string){
    //let timestampNumber = parseInt(timestamp)/1000;
    let time = setLastDate(timestamp);
    return time;
  }
  //// END functions user active ////


  // apro la pg di dettagli conversazione
  goToUserDetail(uidReciver: string) {
    //console.log('goToUserDetail:: ',uidReciver);
    this.navProxy.isOn = false;
    console.log('goToUserDetail::: ',this.navProxy.isOn, uidReciver);
    this.navProxy.pushDetail(ProfilePage, {
      uidUser: uidReciver
    });
  }  
}

