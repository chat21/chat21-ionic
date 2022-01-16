import { UserModel } from 'src/chat21-core/models/user';
import { Component, OnInit, Output, EventEmitter, Input, AfterViewInit, ViewChild, ElementRef, OnChanges, HostListener, Renderer2 } from '@angular/core';

import { Chooser } from '@ionic-native/chooser/ngx';
import { IonTextarea, ModalController, ToastController } from '@ionic/angular';

// Pages
import { LoaderPreviewPage } from 'src/app/pages/loader-preview/loader-preview.page';
// Services 
import { UploadService } from 'src/chat21-core/providers/abstract/upload.service';
// utils
import { TYPE_MSG_TEXT } from 'src/chat21-core/utils/constants';
// Models
import { UploadModel } from 'src/chat21-core/models/upload';
import { Observable } from 'rxjs';
import { checkPlatformIsMobile } from 'src/chat21-core/utils/utils';

// Logger
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';


@Component({
  selector: 'app-message-text-area',
  templateUrl: './message-text-area.component.html',
  styleUrls: ['./message-text-area.component.scss'],
})
export class MessageTextAreaComponent implements OnInit, AfterViewInit, OnChanges {

  @ViewChild('textArea', { static: false }) messageTextArea: IonTextarea

  @ViewChild('message_text_area', { static: false }) message_text_area: ElementRef
  //   set textArea(element: ElementRef<HTMLInputElement>) {
  //     if(element) {
  //       this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] ViewChild element ", element);
  //       element.nativeElement.focus()
  //     }
  //  }


  @ViewChild('fileInput', { static: false }) fileInput: any;

  @Input() loggedUser: UserModel;
  @Input() conversationWith: string;
  @Input() tagsCannedFilter: any = [];
  @Input() tagsCannedCount: number;

  @Input() events: Observable<void>;
  @Input() fileUploadAccept: string
  @Input() isOpenInfoConversation: boolean;
  @Input() translationMap: Map<string, string>;
  @Input() dropEvent: any;
  @Output() eventChangeTextArea = new EventEmitter<object>();
  @Output() hasClickedOpenCannedResponses = new EventEmitter<boolean>();
  @Output() eventSendMessage = new EventEmitter<object>();
  @Output() onPresentModalScrollToBottom = new EventEmitter<boolean>();

  public conversationEnabled = false;
  public messageString: string;
  public HAS_PASTED: boolean = false;
  public toastMsg: string;
  public TEXAREA_PLACEHOLDER: string;
  public LONG_TEXAREA_PLACEHOLDER: string;
  public SHORT_TEXAREA_PLACEHOLDER: string;
  public SHORTER_TEXAREA_PLACEHOLDER: string;
  public currentWindowWidth: any;
  private logger: LoggerService = LoggerInstance.getInstance();
  public countClicks: number = 0;
  public IS_SUPPORT_GROUP_CONVERSATION: boolean;

  TYPE_MSG_TEXT = TYPE_MSG_TEXT;

  tooltipOptions = {
    'show-delay': 500,
    'tooltip-class': 'chat-tooltip',
    'theme': 'light',
    'shadow': false,
    'hide-delay-mobile': 0,
    'hideDelayAfterClick': 3000,
    'hide-delay': 200
  };


  /**
   * Constructor
   * @param chooser 
   * @param modalController 
   * @param uploadService 
   * @param toastController 
   */
  constructor(
    public chooser: Chooser,
    public modalController: ModalController,
    public uploadService: UploadService,
    public toastController: ToastController,
    private renderer: Renderer2,
  ) { }

  // ---------------------------------------------------------
  // @ Lifehooks
  // ---------------------------------------------------------

  ngOnInit() {
    // this.setSubscriptions();
    this.logger.log("[CONVS-DETAIL] [MSG-TEXT-AREA] HELLO !!!!! ");
    // this.events.subscribe((cannedmessage) => {
    //   this.logger.log("[CONVS-DETAIL] [MSG-TEXT-AREA] events.subscribe cannedmessage ", cannedmessage);
    // })

    // this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] LONG_TEXAREA_PLACEHOLDER ", this.LONG_TEXAREA_PLACEHOLDER);
    // this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] SHORT_TEXAREA_PLACEHOLDER ", this.SHORT_TEXAREA_PLACEHOLDER);
    // this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] SHORTER_TEXAREA_PLACEHOLDER ", this.SHORTER_TEXAREA_PLACEHOLDER);

    this.getWindowWidth();
  }



  ngOnChanges() {
    if (this.translationMap) {
      // this.LONG_TEXAREA_PLACEHOLDER = this.translationMap.get('LABEL_ENTER_MSG')
      // this.SHORT_TEXAREA_PLACEHOLDER = this.translationMap.get('LABEL_ENTER_MSG_SHORT')
      // this.SHORTER_TEXAREA_PLACEHOLDER = this.translationMap.get('LABEL_ENTER_MSG_SHORTER')

      this.TEXAREA_PLACEHOLDER = this.translationMap.get('LABEL_ENTER_MSG_SHORT')
    }

    if (this.conversationWith.startsWith("support-group")) {
      this.IS_SUPPORT_GROUP_CONVERSATION = true
    } else {
      this.IS_SUPPORT_GROUP_CONVERSATION = false
    }

    this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] ngOnChanges DROP EVENT ", this.dropEvent);
    this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] ngOnChanges tagsCannedFilter ", this.tagsCannedFilter);
    // console.log("[CONVS-DETAIL][MSG-TEXT-AREA] ngOnChanges  tagsCannedCount ", this.tagsCannedCount);
    

    this.logger.log('[CONVS-DETAIL] - returnChangeTextArea ngOnChanges in [MSG-TEXT-AREA]  this.tagsCannedFilter.length ', this.tagsCannedFilter.length)

    // use case drop
    if (this.dropEvent) {
      this.presentModal(this.dropEvent)
    }
    // if (this.isOpenInfoConversation === true) {
    // this.getIfTexareaIsEmpty('ngOnChanges')
    // this.getWindowWidth();
    // }
  }

  // ngAfterViewInit() {
  ngAfterViewInit() {

    // console.log("[CONVS-DETAIL][MSG-TEXT-AREA] ngAfterViewInit message_text_area ", this.message_text_area);
    // console.log("[CONVS-DETAIL][MSG-TEXT-AREA] ngAfterViewInit messageTextArea ", this.messageTextArea);
    if (this.messageTextArea) {
      setTimeout(() => {

        const elTextArea = this.message_text_area['el'];
        // console.log("[CONVS-DETAIL][MSG-TEXT-AREA] ngAfterViewInit elTextArea ", elTextArea);
        // this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] ngAfterViewInit elTextArea children", elTextArea.children);
        if (elTextArea.children.length === 1) {

          const elTextAreaWrapper = elTextArea.children[0]
          // this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] ngAfterViewInit elTextAreaWrapper", elTextAreaWrapper);

          if (elTextAreaWrapper.children.length === 1) {
            const elNativeTearea = elTextAreaWrapper.children[0]
            // this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] ngAfterViewInit elNativeTearea", elNativeTearea);
            elNativeTearea.setAttribute("style", "height: 37px !important; ");
          }
        }

        // this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] set focus on ", this.messageTextArea);
        // Keyboard.show() // for android
        this.messageTextArea.setFocus();

      }, 1500); //a least 150ms.
    }
  }


  getWindowWidth(): any {
    this.currentWindowWidth = window.innerWidth;


    // if (this.currentWindowWidth >= 844 && this.isOpenInfoConversation === false && this.conversationWith.startsWith("support-group")) {
    //   this.TEXAREA_PLACEHOLDER = this.LONG_TEXAREA_PLACEHOLDER;
    //   this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] currentWindowWidth', this.currentWindowWidth, ' - DISPLAY LONG_TEXAREA_PLACEHOLDER ');
    // } else if (this.currentWindowWidth >= 844 && this.isOpenInfoConversation === true && this.conversationWith.startsWith("support-group")) {
    //   this.TEXAREA_PLACEHOLDER = this.SHORT_TEXAREA_PLACEHOLDER;
    // } else if (this.currentWindowWidth < 844 && this.isOpenInfoConversation === false && this.conversationWith.startsWith("support-group")) {
    //   this.TEXAREA_PLACEHOLDER = this.SHORT_TEXAREA_PLACEHOLDER;
    // } else if (this.currentWindowWidth < 844 && this.isOpenInfoConversation === true && this.conversationWith.startsWith("support-group")) {
    //   this.TEXAREA_PLACEHOLDER = this.SHORTER_TEXAREA_PLACEHOLDER;
    // } else if (!this.conversationWith.startsWith("support-group")) {
    //   this.TEXAREA_PLACEHOLDER = this.SHORT_TEXAREA_PLACEHOLDER;
    // }

    // this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] checkPlatformIsMobile() ", checkPlatformIsMobile());
    if (checkPlatformIsMobile() === true) {

      if (this.currentWindowWidth <= 430 && this.currentWindowWidth >= 274) {
        this.TEXAREA_PLACEHOLDER = this.SHORT_TEXAREA_PLACEHOLDER;

      } else if (this.currentWindowWidth <= 273) {
        this.TEXAREA_PLACEHOLDER = this.SHORTER_TEXAREA_PLACEHOLDER;
      }
    }
  }

  // -------------------------------------------------------------------------------------------
  // Change the placeholder of the 'send message' textarea according to the width of the window  
  // -------------------------------------------------------------------------------------------
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    // this.getIfTexareaIsEmpty('onResize')
    this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA]  event.target.innerWidth; ", event.target.innerWidth);
    


    // if (event.target.innerWidth >= 844 && this.isOpenInfoConversation === false && this.conversationWith.startsWith("support-group")) {
    //   this.TEXAREA_PLACEHOLDER = this.LONG_TEXAREA_PLACEHOLDER;
    // } else if (event.target.innerWidth >= 844 && this.isOpenInfoConversation === true && this.conversationWith.startsWith("support-group")) {
    //   this.TEXAREA_PLACEHOLDER = this.SHORT_TEXAREA_PLACEHOLDER;
    // } else if (event.target.innerWidth < 844 && this.isOpenInfoConversation === false && this.conversationWith.startsWith("support-group")) {
    //   this.TEXAREA_PLACEHOLDER = this.SHORT_TEXAREA_PLACEHOLDER;
    // } else if (event.target.innerWidth < 844 && this.isOpenInfoConversation === true && this.conversationWith.startsWith("support-group")) {
    //   this.TEXAREA_PLACEHOLDER = this.SHORTER_TEXAREA_PLACEHOLDER;
    // } else if (!this.conversationWith.startsWith("support-group")) {
    //   this.TEXAREA_PLACEHOLDER = this.SHORT_TEXAREA_PLACEHOLDER;
    // }

    // this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] checkPlatformIsMobile() ', checkPlatformIsMobile());
    if (checkPlatformIsMobile() === true) {

      if (event.target.innerWidth <= 430 && event.target.innerWidth >= 274) {
        this.TEXAREA_PLACEHOLDER = this.SHORT_TEXAREA_PLACEHOLDER;
      } else if (this.currentWindowWidth <= 273) {
        this.TEXAREA_PLACEHOLDER = this.SHORTER_TEXAREA_PLACEHOLDER;
      }

    }

    // if (checkPlatformIsMobile && event.target.innerWidth <= 430) {
    //   this.TEXAREA_PLACEHOLDER = this.SHORT_TEXAREA_PLACEHOLDER;
    // } else if (checkPlatformIsMobile && event.target.innerWidth > 430) { 
    //   this.TEXAREA_PLACEHOLDER = this.LONG_TEXAREA_PLACEHOLDER;
    // }
  }




  onPaste(event: any) {
    this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] onPaste DROP EVENT ", this.dropEvent);

    this.dropEvent = undefined

    this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] onPaste event ", event);
    const items = (event.clipboardData || event.originalEvent.clipboardData).items;
    let file = null;
    this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] onPaste items ", items);
    for (const item of items) {
      this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] onPaste item ", item);
      this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] onPaste item.type ", item.type);

      if (item.type.startsWith("image")) {

        let content = event.clipboardData.getData('text/plain');
        this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] onPaste content ", content);
        setTimeout(() => {
          this.messageString = "";
        }, 100);


        this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] onPaste item.type  ", item.type);
        file = item.getAsFile();
        const data = new ClipboardEvent('').clipboardData || new DataTransfer();
        data.items.add(new File([file], file.name, { type: file.type }));
        this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] onPaste data ", data);
        this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] onPaste file ", file);

        this.presentModal(data);

      } else if (item.type.startsWith("application")) {

        event.preventDefault();

        this.presentToastOnlyImageFilesAreAllowed();
        // let content = event.clipboardData.getData('text/plain');
        // this.logger.log("[CONVS-DETAIL] [MSG-TEXT-AREA] onPaste else content ", content);
        // setTimeout(() => {
        //   this.messageString = "";
        // }, 0)

        this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] onPaste file NOT SUPPORTED FILE TYPE');
      }
    }
  }

  onFileSelected(e: any) {
    this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] - onFileSelected event', e);
    this.presentModal(e);

  }


  /**
 * 
 * @param e 
 */
  private async presentModal(e: any): Promise<any> {
    this.onPresentModalScrollToBottom.emit(true);
    const that = this;
    let dataFiles = " "
    if (e.type === 'change') {

      this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] presentModal change e', e);
      this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] presentModal change e.target ', e.target);
      this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] presentModal change e.target.files', e.target.files);
      dataFiles = e.target.files;

    } else if (e.type === 'drop') {
      dataFiles = e.dataTransfer.files
      this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] presentModal drop e.dataTransfer.files', e.dataTransfer.files);
    } else {
      // paste use case
      dataFiles = e.files
      this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] presentModal dataFiles when paste', dataFiles);
      // const elemTexarea= <HTMLElement>document.querySelector('#ion-textarea .textarea-wrapper textarea')
      //   const elemTexarea= <HTMLInputElement>document.getElementById('ion-textarea')
      //   this.logger.log('[CONVS-DETAIL] [MSG-TEXT-AREA] presentModal elemTexarea when paste', elemTexarea);


      //  let textarea_value = elemTexarea.value
      //  this.logger.log('[CONVS-DETAIL] [MSG-TEXT-AREA] presentModal textarea_value when paste', textarea_value);
      //  textarea_value = ""
    }
    // this.logger.log('presentModal e.target.files.length', e.target.files.length);

    const attributes = { files: dataFiles, enableBackdropDismiss: false };
    this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] attributes', attributes);
    const modal: HTMLIonModalElement =
      await this.modalController.create({
        component: LoaderPreviewPage,
        componentProps: attributes,
        swipeToClose: false,
        backdropDismiss: true
      });
    modal.onDidDismiss().then((detail: any) => {

      this.logger.log('presentModal onDidDismiss detail', detail);
      if (detail.data !== undefined) {
        let type = ''
        if (detail.data.fileSelected.type && detail.data.fileSelected.type.startsWith("image") && (!detail.data.fileSelected.type.includes('svg'))) {
          this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] FIREBASE-UPLOAD presentModal onDidDismiss detail type ', detail.data.fileSelected.type);
          type = 'image'
          // if ((detail.data.fileSelected.type && detail.data.fileSelected.type.startsWith("application")) || (detail.data.fileSelected.type && detail.data.fileSelected.type === 'image/svg+xml'))
        } else {
          this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] FIREBASE-UPLOAD presentModal onDidDismiss detail type ', detail.data.fileSelected.type);
          type = 'file'

        }

        let fileSelected = null;
        if (e.type === 'change') {
          fileSelected = e.target.files.item(0);

        } else if (e.type === 'drop') {
          this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] FIREBASE-UPLOAD [MSG-TEXT-AREA] DROP dataFiles[0]', dataFiles[0])
          fileSelected = dataFiles[0]
          // const fileList = e.dataTransfer.files;
          // this.logger.log('FIREBASE-UPLOAD [MSG-TEXT-AREA] DROP fileList', fileList)
          // const file: File = fileList[0];
          // this.logger.log('FIREBASE-UPLOAD [MSG-TEXT-AREA] DROP FILE', file)
          // const data = new ClipboardEvent('').clipboardData || new DataTransfer(); 
          // data.items.add(new File([file], file.name, { type: file.type }));
          // this.logger.log('FIREBASE-UPLOAD [MSG-TEXT-AREA] DROP DATA', data)
        } else {
          // PASTE USE CASE 
          this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] FIREBASE-UPLOAD PASTE  e', e)
          fileSelected = e.files.item(0)
        }

        let messageString = detail.data.messageString;
        let metadata = detail.data.metadata;
        // let type = detail.data.type;
        this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] FIREBASE-UPLOAD presentModal onDidDismiss detail.data', detail.data);
        this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] FIREBASE-UPLOAD presentModal onDidDismiss fileSelected', fileSelected);

        if (detail !== null) {
          const currentUpload = new UploadModel(fileSelected);
          this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] FIREBASE-UPLOAD presentModal onDidDismiss currentUpload', currentUpload);
          this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] FIREBASE-UPLOAD presentModal onDidDismiss detail.data', detail.data);

          that.uploadService.upload(that.loggedUser.uid, currentUpload).then(downloadURL => {
            metadata.src = downloadURL;
            this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] FIREBASE-UPLOAD presentModal invio msg metadata::: ', metadata);
            this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] FIREBASE-UPLOAD presentModal invio msg metadata downloadURL::: ', downloadURL);
            this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] FIREBASE-UPLOAD presentModal invio msg type::: ', type);
            this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] FIREBASE-UPLOAD presentModal invio msg message::: ', messageString);
            // send message
            // if(messageString === undefined) {
            //   messageString = metadata.name
            // }

            that.eventSendMessage.emit({ message: messageString, type: type, metadata: metadata });

            that.fileInput.nativeElement.value = '';
            this.dropEvent = null
          }).catch(error => {
            // Use to signal error if something goes wrong.
            this.logger.error(`[CONVS-DETAIL][MSG-TEXT-AREA] FIREBASE-UPLOAD - upload Failed to upload file and get link `, error);

            that.presentToastFailedToUploadFile();
          });

        }
      } else {
        that.fileInput.nativeElement.value = '';
      }
    });

    return await modal.present();
  }


  ionChange(e: any) {
    this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] ionChange event ", e);
    // this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] ionChange detail.value ", e.detail.value);

    const message = e.detail.value
    this.logger.log("[CONVS-DETAIL] [MSG-TEXT-AREA] ionChange message ", message);
    // this.logger.log("[CONVS-DETAIL] [MSG-TEXT-AREA] ionChange  this.messageString ", this.messageString);
    const height = e.target.offsetHeight + 20; // nk added +20
    // this.logger.log("[CONVS-DETAIL] [MSG-TEXT-AREA] ionChange text-area height ", height);
    // this.getIfTexareaIsEmpty('ionChange')
    try {
      if (message.trim().length > 0) {

        this.conversationEnabled = true;
      } else {
        this.conversationEnabled = false;
      }
    } catch (err) {
      this.logger.error("[CONVS-DETAIL][MSG-TEXT-AREA] ionChange err ", err);
      this.conversationEnabled = false;
    }

    this.eventChangeTextArea.emit({ msg: message, offsetHeight: height });
  }

  // ------------------------------------------------------------------------
  // invoked by pressing the enter key on the message input field
  // if the message is not empty it is passed  to the control method
  // ------------------------------------------------------------------------
  onKeydown(e: any, text: string) {
    this.logger.log("[CONVS-DETAIL] - returnChangeTextArea - onKeydown in MSG-TEXT-AREA event", e)
    console.log("[CONVS-DETAIL] - returnChangeTextArea - onKeydown in MSG-TEXT-AREA text", text)
    e.preventDefault(); // Prevent press enter from creating new line 
    // console.log("[CONVS-DETAIL] replaceTagInMessage onKeydown in msg-texarea * event: ", e);

    this.countClicks++;
    this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] onKeydown - countClicks: ', this.countClicks);
    this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] onKeydown - event: ', e);
    this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] onKeydown - event target: ', e.target);
    this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] onKeydown - event target textContent: ', e.target.textContent);
    this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] onKeydown - tagsCannedFilter: ', this.tagsCannedFilter);

    // this.logger.error("[CONVS-DETAIL][MSG-TEXT-AREA] pressedOnKeyboard e.keyCode ", e.keyCode);
    // this.events.subscribe((cannedmessage) => {

    //   console.log("[CONVS-DETAIL] replaceTagInMessage onKeydown in msg-texarea * cannedmessage: ", cannedmessage);
    //   });

    // user and time are the same arguments passed in `events.publish(user, time)`



    let message = e.target.textContent.trim();
    this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] onKeydown - event target textContent (message): ', message);
    // e.inputType === 'insertLineBreak' && 
    if (e.inputType === 'insertLineBreak' && message === '') {

      this.messageString = '';
      return;
    } else {
      var pos = text.lastIndexOf("/");
      this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] onKeydown - POSITION OF '/': ", pos);
      this.logger.log("[CONVS-DETAIL] returnChangeTextArea onKeydown in msg-texarea  POSITION OF '/': ", pos);
      this.logger.log("[CONVS-DETAIL] returnChangeTextArea onKeydown in msg-texarea  this.tagsCannedFilter.length': ", this.tagsCannedFilter.length);
      if (!text.includes("/")) {
        this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] onKeydown - SEND MESSAGE 1 message: ', message);
        this.logger.log("[CONVS-DETAIL] replaceTagInMessage onKeydown in msg-texarea  SEND MESSAGE 1 message: ", message);
        this.messageString = '';
        this.sendMessage(text);
        this.countClicks = 0
      } else if (text.includes("/") && pos === 0 && this.countClicks > 1 && this.tagsCannedFilter.length > 0) {
        this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] onKeydown - tagsCannedFilter.length 2: ', this.tagsCannedFilter.length);
        this.logger.log("[CONVS-DETAIL] replaceTagInMessage onKeydown in msg-texarea SEND MESSAGE 2 message: ", message);
        this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] onKeydown - SEND MESSAGE 2 message value: ', message.value);
        this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] onKeydown - SEND MESSAGE 2 text: ', text);

        this.logger.log("[CONVS-DETAIL] replaceTagInMessage onKeydown in msg-texarea SEND MESSAGE 2 this.tagsCannedFilter.length: ", this.tagsCannedFilter.length);
        this.logger.log("[CONVS-DETAIL] replaceTagInMessage onKeydown in msg-texarea SEND MESSAGE 2 this.countClicks: ", this.countClicks);
        this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] onKeydown in msg-texarea SEND MESSAGE 2 this.countClicks: ", this.countClicks);
        this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] onKeydown - SEND MESSAGE 2 message: ', message);
        this.messageString = '';

        this.sendMessage(text);
        this.countClicks = 0
      } else if (text.includes("/") && pos > 0 && this.countClicks > 1 && this.tagsCannedFilter.length > 0 && text.substr(-1) !== '/') {
        this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] onKeydown - tagsCannedFilter.length 3: ', this.tagsCannedFilter.length);
        this.logger.log("[CONVS-DETAIL] replaceTagInMessage onKeydown in msg-texarea SEND MESSAGE 3 message: ", message);
        // this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] onKeydown - SEND MESSAGE 3 message value: ', message.value);
        this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] onKeydown - SEND MESSAGE 3 text: ', text);

        this.logger.log("[CONVS-DETAIL] replaceTagInMessage onKeydown in msg-texarea SEND MESSAGE 2 this.tagsCannedFilter.length: ", this.tagsCannedFilter.length);
        this.logger.log("[CONVS-DETAIL] replaceTagInMessage onKeydown in msg-texarea SEND MESSAGE 2 this.countClicks: ", this.countClicks);
        this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] onKeydown in msg-texarea SEND MESSAGE 2 this.countClicks: ", this.countClicks);
        this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] onKeydown - SEND MESSAGE 2 message: ', message);
        this.messageString = '';

        this.sendMessage(text);
        this.countClicks = 0
      } else if (text.includes("/") && this.tagsCannedFilter.length === 0) {
        this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] onKeydown - tagsCannedFilter.length 3: ', this.tagsCannedFilter.length);
        this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] onKeydown - SEND MESSAGE 3 message: ', message);
        this.logger.log("[CONVS-DETAIL] replaceTagInMessage onKeydown in msg-texarea SEND MESSAGE 3 message: ", message);
        this.messageString = '';

        this.sendMessage(text);
        this.countClicks = 0

      }
    }
  }
  openCannedResponses() {
    // console.log('[MSG-TEXT-AREA] has clicked OPEN-CANNED-RESPONSES messageString ', this.messageString)
    // if (this.messageString) {
    //   console.log('[MSG-TEXT-AREA] has clicked OPEN-CANNED-RESPONSES messageString.trim ', this.messageString.trim)
    // }  
    // if (this.messageString === undefined) {
    //   this.messageString = '/'
    // } else {

    // }

    // const elTextArea = this.message_text_area['el'];
    // console.log('[MSG-TEXT-AREA]   textArea elTextArea ', elTextArea)
    // const textArea = elTextArea.getElementsByTagName('ion-textarea')[0];
    // console.log("[MSG-TEXT-AREA]   textArea textArea ", textArea);
    // this.logger.log("[MSG-TEXT-AREA]   textArea value", textArea.value)

    this.hasClickedOpenCannedResponses.emit(true);
  }


  sendMessage(text: string) {
    this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] sendMessage text', text);
    this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] sendMessage conve width', this.conversationWith);
    // text.replace(/\s/g, "")
    this.messageString = '';
    // text = text.replace(/(\r\n|\n|\r)/gm, '');
    if (text && text.trim() !== '') {
      this.eventSendMessage.emit({ message: text, type: TYPE_MSG_TEXT });
    }
  }

  // --------------------------------
  // on mobile !
  // --------------------------------
  onFileSelectedMobile(e: any) {
    this.logger.log('controlOfMessage');
    this.chooser.getFile()
      .then(file => {
        this.logger.log(file ? file.name : 'canceled');
      })
      .catch((error: any) => {
        this.logger.error(error);
      });
  }

  async presentToastOnlyImageFilesAreAllowed() {
    const toast = await this.toastController.create({
      message: this.translationMap.get('ONLY_IMAGE_FILES_ARE_ALLOWED_TO_PASTE'),
      duration: 3000,
      color: "danger",
      cssClass: 'toast-custom-class',
    });
    toast.present();
  }


  async presentToastFailedToUploadFile() {
    const toast = await this.toastController.create({
      message: this.translationMap.get('UPLOAD_FILE_ERROR'),
      duration: 3000,
      color: "danger",
      cssClass: 'toast-custom-class',
    });
    toast.present();
  }


  private async closeModal() {
    this.logger.log('closeModal', this.modalController);
    await this.modalController.getTop();
    this.modalController.dismiss({ confirmed: true });
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {

    // Note: on mac keyboard "metakey" matches "cmd"
    if (event.key === 'Enter' && event.altKey || event.key === 'Enter' && event.ctrlKey || event.key === 'Enter' && event.metaKey) {
      this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] HAS PRESSED COMBO KEYS this.messageString', this.messageString);
      if (this.messageString !== undefined && this.messageString.trim() !== '') {
        this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] HAS PRESSED Enter + ALT this.messageString', this.messageString);
        this.messageString = this.messageString + "\r\n"
      }
    }

  }


  /* NOT USED */
  // getIfTexareaIsEmpty(calledby: string) {
  //   let elemTexarea = <HTMLElement>document.querySelector('#ion-textarea');
  //   this.logger.log("[CONVS-DETAIL] [MSG-TEXT-AREA] elemTexarea ", elemTexarea)
  //   if (this.messageString == null || this.messageString == '') {


  //     if (elemTexarea) {
  //       this.logger.log("[CONVS-DETAIL] [MSG-TEXT-AREA] messageString is empty - called By ", calledby)
  //       elemTexarea.style.height = "30px !important";
  //       elemTexarea.style.overflow = "hidden !important";
  //     }
  //   } else {

  //     if (elemTexarea) {
  //       this.logger.log("[CONVS-DETAIL] [MSG-TEXT-AREA] messageString not empty - called By ", calledby)
  //       elemTexarea.style.height = null;
  //       elemTexarea.style.overflow = null;
  //     }
  //   }
  // }




  // attualmente non usata
  // dovrebbe scattare quando termina il caricamento dell'immagine per inviare il messaggio
  // private setSubscriptions() {
  //   const that = this;
  //   const subscribeBSStateUpload = this.uploadService.BSStateUpload.subscribe((data: any) => {
  //     this.logger.log('***** BSStateUpload *****', data);
  //     if (data) {
  //       let message = data.message;
  //       let type_message = data.type_message;
  //       let metadata = data.metadata;
  //       this.logger.log('***** message *****', message);
  //       this.logger.log('***** type_message *****', type_message);
  //       this.logger.log('***** metadata *****', metadata);
  //       //this.eventSendMessage.emit({ message: messageString, type: TYPE_MSG_TEXT });
  //     }
  //   });
  // }

}
