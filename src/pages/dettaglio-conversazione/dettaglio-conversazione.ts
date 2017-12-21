import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavParams, Content, Events, NavController } from 'ionic-angular';

// firebase
// import * as firebase from 'firebase/app';

// models
import { UserModel } from '../../models/user';
import { MessageModel } from '../../models/message';

// providers
import { MessageProvider } from '../../providers/message/message';

// services 
import { ApplicationContext } from '../../providers/application-context/application-context';
import { UserService } from '../../providers/user/user';
import { NavProxyService } from '../../providers/nav-proxy';
import { ChatPresenceHandler } from '../../providers/chat-presence-handler';

// pages
import { _DetailPage } from '../_DetailPage';
import { ProfilePage } from '../profile/profile';

// utils
import { urlify, setLastDate, setHeaderDate } from '../../utils/utils';
import { LABEL_NO_MSG_HERE, LABEL_ACTIVE_NOW, PARENT_PAGE_DETAIL_CONVERSATION, MIN_HEIGHT_TEXTAREA, MSG_STATUS_FAILED,MSG_STATUS_SENDING, MSG_STATUS_SENT, MSG_STATUS_RECEIVED, MSG_STATUS_RETURN_RECEIPT } from '../../utils/constants';

// directives
// import { AutosizeDirective } from '../../directives/autosize/autosize';


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
  private firebaseMessages: any;
  private messages: Array<MessageModel> = [];
  private conversationWith: string;
  //private uidSender: string;
  //private uidReciver: string;
  private currentUserDetail: UserModel;
  private conversationWithDetail: UserModel;

  private online: boolean;
  private lastConnectionDate: string;
  private messageString: string;
  //private styleMessageWelcome: boolean;
  private userFirebase: any;
  //private subscriptionUserFirebase:any;

  
  LABEL_ACTIVE_NOW = LABEL_ACTIVE_NOW;
  LABEL_NO_MSG_HERE = LABEL_NO_MSG_HERE;
  MSG_STATUS_SENDING = MSG_STATUS_SENDING;
  MSG_STATUS_SENT = MSG_STATUS_SENT;
  MSG_STATUS_RETURN_RECEIPT = MSG_STATUS_RETURN_RECEIPT;
  

  constructor(
    public navParams: NavParams,
    public navCtrl: NavController,
    public chatPresenceHandler: ChatPresenceHandler,
    public navProxy: NavProxyService,
    public messageProvider: MessageProvider,
    public userService: UserService,
    public events: Events,
    public applicationContext: ApplicationContext
  ) {
    super();
    // recupero id utente con cui si conversare
    this.conversationWith = navParams.get('conversationWith');
  }

  ngOnInit() {
    console.log('CONVERSO CON: ',this.conversationWith);
    // inizializzo la conversazione 
    this.initialize();
  }

  ionicViewWillLeave(){
    // aggiorno stato conversazione come letto
  }

  ionViewDidEnter(){
    this.content.scrollDownOnLoad = true;
  }
  //// END functions of system ////

  //// START functions messages ////
  initialize(){
    console.log('initialize **************');
    // setto array messaggi
    this.messages = [];
    // setto stato online currentuser
    this.online = false;
    this.lastConnectionDate = '';
    console.log(' 1 - Resetto elenco messaggi, stato e lastconnection online del conversationWith');

    // recupero current currentUserDetail
    this.currentUserDetail = this.userService.getCurrentUserDetails();
    console.log(' 2 - Recupero dettagli di current user', this.currentUserDetail);
    // recupero dettagli user conversation with
    this.getConversationWithUserDetail();
    console.log(' 3 - Recupero dettagli di user with', this.conversationWithDetail);
    // recupero info status user conversation with
    this.setupOnlineStatus();
    console.log(' 4 - Imposto status online del conversationWith ', this.conversationWithDetail);
    // imposto array messaggi
    this.getMessages();
  }

  getConversationWithUserDetail(){
    // creo Dettaglio user con cui converso 
    const userDetails = new UserModel(this.conversationWith, '', '', '', this.conversationWith, '');
    console.log("userDetails vuoto: ",userDetails);
    this.conversationWithDetail = userDetails;
    // setto userFirebase
    let that = this;
    this.userFirebase = this.userService.setUserDetail(this.conversationWith);
    // recupero dettaglio user con cui converso
    this.userFirebase.on('value', function(snapshot) {
      const user = snapshot.val();
      if (user){
        const fullname = user.firstname+" "+user.lastname;
        const userDetails = new UserModel(user.uid, user.email, user.firstname, user.lastname, fullname, user.imageurl);
        console.log("userDetails: ",userDetails);
        that.conversationWithDetail = userDetails;
      }
    });
  }
  
  // get list messages
  getMessages(){
    this.firebaseMessages = this.messageProvider.loadListMeggages(this.conversationWith);
    let that = this;
    // recupero gli ultimi 100 messaggi !!!!
    this.firebaseMessages.limitToLast(100).on("value", function(snapshot) {
      console.log(" ++++++ GET MESSAGGI: ");
      var lastDate: string = "";
      that.messages = [];
      snapshot.forEach( function(data) {
        let item = data.val();
        // imposto il giorno del messaggio per visualizzare o nascondere l'header data
        let calcolaData = setHeaderDate(item['timestamp'], lastDate);
        if(calcolaData != null){
          lastDate = calcolaData;
        }
        const contentText = urlify(item['text']);
        // creo oggetto messaggio e lo aggiungo all'array dei messaggi
        const message = new MessageModel(item['language'], item['recipient'], item['recipient_fullname'], item['sender'], item['sender_fullname'], item['status'], contentText, item['timestamp'], calcolaData, item['type']);
        that.messages.push(message);
        // aggiorno stato messaggio
        // questo stato indica che è stato consegnato al client e NON la lettura
        if(item['status'] < MSG_STATUS_RECEIVED){
          that.messageProvider.setStatusMessage(data,that.conversationWith);
        }
      });
      that.doScroll();
    });
  }

  //// START functions user active ////
  setupOnlineStatus(){
    const that = this;
    const onlineRef =  this.chatPresenceHandler.onlineRefForUser(this.conversationWith);
    onlineRef.on("value", (child) => {
      if(child.val()){
        that.online = true;
      }
      else {
        that.online = false;
      }
    })
    // LAST ONLINE
    let lastOnlineRef = this.chatPresenceHandler.lastOnlineRefForUser(this.conversationWith);
    lastOnlineRef.on("value", (child) => {
      if(child.val()){
        that.lastConnectionDate = this.getTimeLastConnection(child.val());
      }
    });
  }
  getTimeLastConnection(timestamp:string){
    //let timestampNumber = parseInt(timestamp)/1000;
    let time = setLastDate(timestamp);
    return time;
  }
  //// END functions user active ////

  //// START Scroll managemant functions ////
  // Scroll to bottom of page after a short delay.
  scrollBottom() {
    let that = this;
    //console.log('scrollBottom1 **************', that.content);
    setTimeout(function() {
      console.log('scrollBottom **************', that.content._scroll);
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




  //// START FUNZIONI RICHIAMATE DA HTML ////

  // Check if the user is the sender of the message.
  isSender(message) {
    return this.messageProvider.isSender(message);
  }

  // Send message
  sendMessage(msg) {
    console.log("SEND MESSAGE: ", msg);
    //console.log("messageTextArea:: ",this.messageTextArea['_elementRef'].nativeElement.getElementsByTagName('textarea')[0].style);
    if (msg && msg.trim() != ''){
      this.messageTextArea['_elementRef'].nativeElement.getElementsByTagName('textarea')[0].style.height = MIN_HEIGHT_TEXTAREA+"px";
      //this.messageString = urlify(msg);
      let now: Date = new Date();
      let timestamp = now.valueOf();

      const language = document.documentElement.lang;
      const sender_fullname =  this.currentUserDetail.fullname;
      const recipient_fullname = this.conversationWithDetail.fullname;
      
      if(this.firebaseMessages) {
          const message = {
              language: language,
              recipient: this.conversationWith,
              recipient_fullname: recipient_fullname,
              sender: this.currentUserDetail.uid,
              sender_fullname: sender_fullname,
              //status: MSG_STATUS_SENDING,
              text: this.messageString,
              timestamp: timestamp,
              type: 'text'
          };
          console.log('messaggio **************',message, this.messageProvider);
          this.messageString = "";
          var newMessageRef = this.firebaseMessages.push();
          console.log('111');
          newMessageRef.set(message);
          console.log('222');
          //this.events.publish('setConversationSelected:change',this.conversationWith); 
          // nn mi ricordo a cosa serve!!! sembra a niente ??????
      }
    }
    else {
      this.messageString = "";
    }
  }

  // invocata dal focus sul campo di input
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

  // apro la pg di dettagli conversazione
  goToUserDetail(uidReciver: string) {
    console.log('goToUserDetail::: ',this.navProxy.isOn, uidReciver);
    this.navCtrl.push(ProfilePage, {
      uidUser: uidReciver
    });
  }
  //// END FUNZIONI RICHIAMATE DA HTML ////


}

