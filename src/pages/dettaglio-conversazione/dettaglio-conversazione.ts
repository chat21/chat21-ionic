import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavParams, Content, Events, NavController } from 'ionic-angular';

// firebase
import * as firebase from 'firebase/app';

// models
import { UserModel } from '../../models/user';
import { MessageModel } from '../../models/message';

// providers
import { UserService } from '../../providers/user/user';
import { MessageProvider } from '../../providers/message/message';
import { NavProxyService } from '../../providers/nav-proxy';
import { ChatPresenceHandler } from '../../providers/chat-presence-handler';

// pages
import { _DetailPage } from '../_DetailPage';
import { ProfilePage } from '../profile/profile';

// utils
import { urlify, setLastDate, setHeaderDate } from '../../utils/utils';
import { PARENT_PAGE_DETAIL_CONVERSATION, MIN_HEIGHT_TEXTAREA, MSG_STATUS_FAILED,MSG_STATUS_SENDING, MSG_STATUS_SENT, MSG_STATUS_RECEIVED, MSG_STATUS_SEEN } from '../../utils/constants';

// directives
import { AutosizeDirective } from '../../directives/autosize/autosize';


@IonicPage()
@Component({
  selector: 'page-dettaglio-conversazione',
  templateUrl: 'dettaglio-conversazione.html',
})
export class DettaglioConversazionePage extends _DetailPage{
  @ViewChild(Content) content: Content;
  @ViewChild('messageTextArea') messageTextArea: ElementRef;
  //@ViewChild('messageTextArea') messageTextArea: ElementRef;   

  private scrollDirection: any = 'bottom';
  private firebaseMessages;
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
  private userFirebase: any;
  private subscriptionUserFirebase:any;

  constructor(
    public navParams: NavParams,
    public navCtrl: NavController,
    public chatPresenceHandler: ChatPresenceHandler,
    public navProxy: NavProxyService,
    public messageProvider: MessageProvider,
    public userService: UserService,
    public events: Events,
  ) {
    super();
    this.messages = [];
    //let heightTest = "300px";

    // setto stato online currentuser
    this.online = false;

    // recupero current user id
    this.uidSender = firebase.auth().currentUser.uid;

    // recupero id riciver
    this.uidReciver = navParams.get('convers_with');

    // recupero conversationId
    this.conversationId = navParams.get('conversationId');
    if(!this.conversationId){
      this.conversationId = this.messageProvider.createConversationId(this.uidSender, this.uidReciver);
    }
    this.initialize();
  }

  ngOnDestroy(){
    console.log('ngOnDestroy **************');
  }

  ngOnInit() {
    console.log('ngOnInit **************');
  }
  ionicViewWillLeave(){
    // aggiorno stato conversazione come letto
    // caso particolare nel quale arrivano messaggi alla conversazione evidenziata
    this.updateConversationState();
  }
  
  ionViewDidEnter(){
    this.content.scrollDownOnLoad = true;
    // aggiorno stato conversazione come letto
    this.updateConversationState();
  }
  //// END functions of system ////

  //// START functions messages ////
  updateConversationState(){
    // se esistono dei messaggi nella conversazione
    this.messageProvider.setStatusConversation(this.conversationId);
    // console.log("updateConversationState::",this.messages.length);
    // if(this.messages.length > 0){
    //   // aggiorno lo stato dei messaggi come letto
    //   // baggato da controllare!!!
    //   // this.messageProvider.setStatusMessage(this.messages);
    //   // aggiorno lo stato della conversazione
    //   let lastMessage = this.messages.slice(-1)[0];
    //   if(lastMessage){
    //     this.messageProvider.setStatusConversation(lastMessage);
    //   }
    // }
    // else {
    //   // // altrimenti se nn ci sono ancora messaggi e quindi sto x creare una conversazione
    //   // // visualizzo div content_message_welcome
    //   // this.style_message_welcome = true;
    //   // console.log("this.content_message_welcome::",this.style_message_welcome);
    // }
  }

  initialize(){
    console.log('initialize **************');
    // se esiste imposto array messaggi
    this.firebaseMessages = this.messageProvider.loadListMeggages(this.uidReciver, this.uidSender);
    this.getMessages();
    // controllo se esiste il nodo conversazione
    let that = this;
    this.messageProvider.ifConversationExist()
    .then(function(snapshot) {
      console.log("ifConversationExist?: " + snapshot + " --> "+snapshot.hasChild(that.conversationId));
      if (snapshot.hasChild(that.conversationId)) {
        console.log('LA CONVERSAZIONE ESISTE *************');
      }
      else {
        // altrimenti se nn ci sono ancora messaggi e quindi sto x creare una conversazione
        // visualizzo div content_message_welcome
        this.style_message_welcome = true;
        console.log("this.content_message_welcome::",this.style_message_welcome);
      }
    })
    .catch(function (error) {
      console.log("ifConversationExist failed: " + error.message);
    });
    

    // setto userFirebase
    this.userFirebase = this.userService.setUserDetail(this.uidReciver);
    // recupero riciver user detail

    // this.subscriptionUserFirebase = this.userFirebase.snapshotChanges()
    // .subscribe(snapshot => {
    
    this.userFirebase.on('value', function(snapshot) {
      const user = snapshot.val();
      if (user){
        const fullname = user.name+" "+user.surname;
        const userDetails = new UserModel(user.uid, user.email, user.name, user.surname, fullname, user.imageurl);
        console.log("userDetails",userDetails);
        that.userRecipient = userDetails;
      }
      else{
        const userDetails = new UserModel(that.uidReciver, '', '', '', that.uidReciver, '');
        console.log("userDetails vuoto",userDetails);
        that.userRecipient = userDetails;
      }
    });
    // recupero current currentUserDetail
    this.currentUser = this.userService.getCurrentUserDetails();
    console.log('this.currentUser *************', this.currentUser);
    // recupero info status user reciver
    this.setupOnlineStatus();
    console.log('this.setupOnlineStatus *************');
  }

  
  // get list messages
  getMessages(){
    console.log("uidSender:::uidReciver:: ",this.uidSender, this.uidReciver, this.messageProvider);
    //let messagesTEMP = [];
    let that = this;
    var lastDate: string = "";
    this.firebaseMessages.limitToLast(100).on("value", function(snapshot) {
      that.messages = [];
      console.log("that.messages::",that.messages);
      snapshot.forEach(function(data) {
        let item = data.val();
        // imposto il giorno del messaggio per visualizzare o nascondere l'header data
        let calcolaData = setHeaderDate(item['timestamp'], lastDate);
        if(calcolaData != null){
          lastDate = calcolaData;
        }
        // creo oggetto messaggio e lo aggiungo all'array dei messaggi
        const message = new MessageModel(item['conversationId'], item['recipient'], item['sender'], item['sender_fullname'], item['status'], item['text'], item['timestamp'], calcolaData, item['type']);
        // console.log('this.message *************', message, that.messages);
        that.messages.push(message);
        // aggiorno stato messaggio
        // questo stato indica che è stato consegnato al client e NON la lettura
        if(item['status']!=2){
          that.messageProvider.setStatusMessage(data);
        }
      });
      that.doScroll();
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
      // console.log("messageString:::firebaseMessages",msg, msg);
      this.messageString = urlify(msg);
      // console.log("messageString:::firebaseMessages", this.messageString, this.currentUser);
      let now: Date = new Date();
      let timestamp = now.valueOf();
      
      //creo messaggio e lo aggiungo all'array
      //cambio lo stato da 0 a 1 e lo invio
      //quando lo ricevo cambio lo stato a 2

      //const converationsObj = firebase.database().ref(urlNodeFirebase);

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
          var newMessageRef = this.firebaseMessages.push();
          newMessageRef.set(message);
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
    let that = this;
    //console.log('scrollBottom1 **************', that.content);
    setTimeout(function() {
      console.log('scrollBottom2 **************', that.content._scroll);
      if(that.content._scroll){
        that.content.scrollToBottom(0);
      }
    }, 300);
  }
  // Scroll to top of the page after a short delay.
  scrollTop() {
    let that = this;
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
    console.log('goToUserDetail::: ',this.navProxy.isOn, uidReciver);
    this.navCtrl.push(ProfilePage, {
      uidUser: uidReciver
    });
    // this.navProxy.pushDetail(ProfilePage, {
    //   uidUser: uidReciver,
    //   parentPage: PARENT_PAGE_DETAIL_CONVERSATION
    // });
  }  
}

