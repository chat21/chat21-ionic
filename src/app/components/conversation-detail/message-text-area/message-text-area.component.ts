import { UserModel } from 'src/chat21-core/models/user';
import { Component, OnInit, Output, EventEmitter, Input, AfterViewInit, ViewChild, ElementRef, OnChanges, HostListener } from '@angular/core';
import { IonTextarea } from '@ionic/angular';
import { Chooser } from '@ionic-native/chooser/ngx';
import { ModalController, ToastController } from '@ionic/angular';

// pages
import { LoaderPreviewPage } from 'src/app/pages/loader-preview/loader-preview.page';
// services 
import { UploadService } from 'src/chat21-core/providers/abstract/upload.service';
// utils
import { TYPE_MSG_TEXT } from 'src/chat21-core/utils/constants';
// models
import { UploadModel } from 'src/chat21-core/models/upload';
import { Observable } from 'rxjs';
import { checkPlatformIsMobile } from 'src/chat21-core/utils/utils';


@Component({
  selector: 'app-message-text-area',
  templateUrl: './message-text-area.component.html',
  styleUrls: ['./message-text-area.component.scss'],
})
export class MessageTextAreaComponent implements OnInit, AfterViewInit, OnChanges {

  // @ViewChild('focusInput') myInput;
  @ViewChild('textArea', { static: false }) messageTextArea
  @ViewChild('fileInput', { static: false }) fileInput: any;

  @Input() loggedUser: UserModel;
  @Input() conversationWith: string;
  @Input() tagsCannedFilter: any = [];
  @Input() events: Observable<void>;
  @Input() fileUploadAccept: string
  @Input() isOpenInfoConversation: boolean;
  @Input() translationMap: Map<string, string>;
  @Input() dropEvent: any;
  @Output() eventChangeTextArea = new EventEmitter<object>();
  @Output() eventSendMessage = new EventEmitter<object>();


  public conversationEnabled = false;
  public messageString: string;
  public HAS_PASTED: boolean = false;
  public toastMsg: string;
  public TEXAREA_PLACEHOLDER: string;
  public LONG_TEXAREA_PLACEHOLDER: string;
  public SHORT_TEXAREA_PLACEHOLDER: string;
  public SHORTER_TEXAREA_PLACEHOLDER: string;
  public currentWindowWidth: any
  TYPE_MSG_TEXT = TYPE_MSG_TEXT;

  constructor(
    public chooser: Chooser,
    public modalController: ModalController,
    public uploadService: UploadService,
    public toastController: ToastController
  ) { }

  ngOnInit() {
    // this.setSubscriptions();
    console.log("CONVERSATION-DETAIL (MESSAGE-TEXT-AREA) HELLO !!!!! ");
    // this.events.subscribe((cannedmessage) => {
    //   console.log("CONVERSATION-DETAIL (MESSAGE-TEXT-AREA) events.subscribe cannedmessage ", cannedmessage);
    // })
    this.LONG_TEXAREA_PLACEHOLDER = this.translationMap.get('LABEL_ENTER_MSG')
    this.SHORT_TEXAREA_PLACEHOLDER = this.translationMap.get('LABEL_ENTER_MSG_SHORT')
    this.SHORTER_TEXAREA_PLACEHOLDER = this.translationMap.get('LABEL_ENTER_MSG_SHORTER')
    console.log("CONVERSATION-DETAIL (MESSAGE-TEXT-AREA) LONG_TEXAREA_PLACEHOLDER ", this.LONG_TEXAREA_PLACEHOLDER);
    console.log("CONVERSATION-DETAIL (MESSAGE-TEXT-AREA) SHORT_TEXAREA_PLACEHOLDER ", this.SHORT_TEXAREA_PLACEHOLDER);
    console.log("CONVERSATION-DETAIL (MESSAGE-TEXT-AREA) SHORTER_TEXAREA_PLACEHOLDER ", this.SHORTER_TEXAREA_PLACEHOLDER);
    this.getWindowWidth();
  }



  getWindowWidth(): any {
    this.currentWindowWidth = window.innerWidth;
    console.log("CONVERSATION-DETAIL (MESSAGE-TEXT-AREA) currentWindowWidth ", this.currentWindowWidth);
    if ((this.currentWindowWidth < 1045 && this.currentWindowWidth > 835) && this.isOpenInfoConversation === true) {
      console.log("CONVERSATION-DETAIL (MESSAGE-TEXT-AREA) DISPLAY SHORT_TEXAREA_PLACEHOLDER ");
      // this.TEXAREA_PLACEHOLDER = '';
      this.TEXAREA_PLACEHOLDER = this.SHORT_TEXAREA_PLACEHOLDER;
    } else if (this.currentWindowWidth < 835 && this.isOpenInfoConversation === true) {
      console.log("CONVERSATION-DETAIL (MESSAGE-TEXT-AREA) DISPLAY SHORTER_TEXAREA_PLACEHOLDER ");
      this.TEXAREA_PLACEHOLDER = this.SHORTER_TEXAREA_PLACEHOLDER;
      // this.TEXAREA_PLACEHOLDER = '';

    } else {
      console.log("CONVERSATION-DETAIL (MESSAGE-TEXT-AREA) DISPLAY LONG_TEXAREA_PLACEHOLDER ");
      this.TEXAREA_PLACEHOLDER = this.LONG_TEXAREA_PLACEHOLDER;
      // this.TEXAREA_PLACEHOLDER = '';
    }

    console.log("CONVERSATION-DETAIL (MESSAGE-TEXT-AREA) checkPlatformIsMobile() ", checkPlatformIsMobile());
    if (checkPlatformIsMobile() === true) {

      if (this.currentWindowWidth <= 430) {
        this.TEXAREA_PLACEHOLDER = this.SHORT_TEXAREA_PLACEHOLDER;
      } else {
        this.TEXAREA_PLACEHOLDER = this.LONG_TEXAREA_PLACEHOLDER;
      }

    }
    // if (checkPlatformIsMobile &&  this.currentWindowWidth <= 430) {
    //   this.TEXAREA_PLACEHOLDER = this.SHORT_TEXAREA_PLACEHOLDER;
    // } else if (checkPlatformIsMobile &&  this.currentWindowWidth > 430) { 
    //   this.TEXAREA_PLACEHOLDER = this.LONG_TEXAREA_PLACEHOLDER;
    // }
  }


  ngAfterViewInit() {

    // this.getIfTexareaIsEmpty('ngAfterViewInit')

    setTimeout(() => {
      console.log("MESSAGE-TEXT-AREA set focus on ", this.messageTextArea);
      // Keyboard.show() // for android
      this.messageTextArea.setFocus();
    }, 300); //a least 150ms.
  }

  ngOnChanges() {
    console.log("CONVERSATION-DETAIL (MESSAGE-TEXT-AREA) ngOnChanges  this.isOpenInfoConversation ", this.isOpenInfoConversation);
    console.log("CONVERSATION-DETAIL (MESSAGE-TEXT-AREA) ngOnChanges  DROP EVENT ", this.dropEvent);

    if (this.dropEvent) {
      this.presentModal(this.dropEvent)
    }
    // if (this.isOpenInfoConversation === true) {
    // this.getIfTexareaIsEmpty('ngOnChanges')
    this.getWindowWidth();
    // }
  }

  ionChange(e: any) {

    console.log("CONVERSATION-DETAIL (MESSAGE-TEXT-AREA) ionChange event ", e);
    console.log("CONVERSATION-DETAIL (MESSAGE-TEXT-AREA) ionChange detail.value ", e.detail.value);

    const message = e.detail.value
    console.log("CONVERSATION-DETAIL (MESSAGE-TEXT-AREA) ionChange message ", message);
    // console.log("CONVERSATION-DETAIL (MESSAGE-TEXT-AREA) ionChange  this.messageString ", this.messageString);
    const height = e.target.offsetHeight + 20; // nk added +20
    console.log("CONVERSATION-DETAIL (MESSAGE-TEXT-AREA) ionChange text-area height ", height);
    // this.getIfTexareaIsEmpty('ionChange')
    try {
      if (message.trim().length > 0) {

        this.conversationEnabled = true;
      } else {
        this.conversationEnabled = false;
      }
    } catch (err) {
      this.conversationEnabled = false;
    }

    this.eventChangeTextArea.emit({ msg: message, offsetHeight: height });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    // this.getIfTexareaIsEmpty('onResize')
    console.log("CONVERSATION-DETAIL (MESSAGE-TEXT-AREA)  event.target.innerWidth; ", event.target.innerWidth);
    if ((event.target.innerWidth < 1045 && event.target.innerWidth > 835) && this.isOpenInfoConversation === true) {
      console.log("CONVERSATION-DETAIL (MESSAGE-TEXT-AREA)  ON RESIZE DISPAY SHORT_TEXAREA_PLACEHOLDER");
      this.TEXAREA_PLACEHOLDER = this.SHORT_TEXAREA_PLACEHOLDER;
    } else if (event.target.innerWidth < 835 && this.isOpenInfoConversation === true) {
      this.TEXAREA_PLACEHOLDER = this.SHORTER_TEXAREA_PLACEHOLDER;
    } else {
      this.TEXAREA_PLACEHOLDER = this.LONG_TEXAREA_PLACEHOLDER;
    }

    console.log("CONVERSATION-DETAIL (MESSAGE-TEXT-AREA) checkPlatformIsMobile() ", checkPlatformIsMobile());
    if (checkPlatformIsMobile() === true) {

      if (event.target.innerWidth <= 430) {
        this.TEXAREA_PLACEHOLDER = this.SHORT_TEXAREA_PLACEHOLDER;
      } else {
        this.TEXAREA_PLACEHOLDER = this.LONG_TEXAREA_PLACEHOLDER;
      }

    }

    // if (checkPlatformIsMobile && event.target.innerWidth <= 430) {
    //   this.TEXAREA_PLACEHOLDER = this.SHORT_TEXAREA_PLACEHOLDER;
    // } else if (checkPlatformIsMobile && event.target.innerWidth > 430) { 
    //   this.TEXAREA_PLACEHOLDER = this.LONG_TEXAREA_PLACEHOLDER;
    // }
  }

  getIfTexareaIsEmpty(calledby: string) {
    let elemTexarea = <HTMLElement>document.querySelector('#ion-textarea');
    console.log("CONVERSATION-DETAIL (MESSAGE-TEXT-AREA) elemTexarea ", elemTexarea)
    if (this.messageString == null || this.messageString == '') {


      if (elemTexarea) {
        console.log("CONVERSATION-DETAIL (MESSAGE-TEXT-AREA) messageString is empty - called By ", calledby)
        elemTexarea.style.height = "30px !important";
        elemTexarea.style.overflow = "hidden !important";
      }
    } else {

      if (elemTexarea) {
        console.log("CONVERSATION-DETAIL (MESSAGE-TEXT-AREA) messageString not empty - called By ", calledby)
        elemTexarea.style.height = null;
        elemTexarea.style.overflow = null;
      }
    }
  }

  onPaste(event: any) {
    console.log("CONVERSATION-DETAIL (MESSAGE-TEXT-AREA) onPaste event ", event);
    const items = (event.clipboardData || event.originalEvent.clipboardData).items;
    let file = null;
    console.log("CONVERSATION-DETAIL (MESSAGE-TEXT-AREA) onPaste items ", items);
    for (const item of items) {
      console.log("CONVERSATION-DETAIL (MESSAGE-TEXT-AREA) onPaste item ", item);
      console.log("CONVERSATION-DETAIL (MESSAGE-TEXT-AREA) onPaste item.type ", item.type);
      if (item.type.startsWith("image")) {

        let content = event.clipboardData.getData('text/plain');
        console.log("CONVERSATION-DETAIL (MESSAGE-TEXT-AREA) onPaste content ", content);
        setTimeout(() => {
          this.messageString = "";
        }, 0);


        console.log("CONVERSATION-DETAIL (MESSAGE-TEXT-AREA) onPaste item.type  ", item.type);
        file = item.getAsFile();
        const data = new ClipboardEvent('').clipboardData || new DataTransfer();
        data.items.add(new File([file], file.name, { type: file.type }));
        console.log("CONVERSATION-DETAIL (MESSAGE-TEXT-AREA) onPaste data ", data);
        console.log("CONVERSATION-DETAIL (MESSAGE-TEXT-AREA) onPaste file ", file);
        this.presentModal(data);
      }
    }
  }


  // attualmente non usata
  // dovrebbe scattare quando termina il caricamento dell'immagine per inviare il messaggio
  // private setSubscriptions() {
  //   const that = this;
  //   const subscribeBSStateUpload = this.uploadService.BSStateUpload.subscribe((data: any) => {
  //     console.log('***** BSStateUpload *****', data);
  //     if (data) {
  //       let message = data.message;
  //       let type_message = data.type_message;
  //       let metadata = data.metadata;
  //       console.log('***** message *****', message);
  //       console.log('***** type_message *****', type_message);
  //       console.log('***** metadata *****', metadata);
  //       //this.eventSendMessage.emit({ message: messageString, type: TYPE_MSG_TEXT });
  //     }
  //   });
  // }

  /**
   * invocata dalla pressione del tasto invio sul campo di input messaggio
   * se il messaggio non è vuoto lo passo al metodo di controllo
   */
  pressedOnKeyboard(e: any, text: string) {
    console.log('pressedOnKeyboard ************** event:: ', e);
    const message = e.target.textContent.trim();
    if (e.inputType === 'insertLineBreak' && message === '') {
      this.messageString = '';
      return;
    } else {
      this.messageString = '';
      this.sendMessage(text);
    }
  }

  /** */
  sendMessage(text: string) {
    console.log('CONVERSATION-DETAIL (MESSAGE-TEXT-AREA) sendMessage', text);
    console.log('CONVERSATION-DETAIL (MESSAGE-TEXT-AREA) sendMessage conve width', this.conversationWith);
    // text.replace(/\s/g, "")
    this.messageString = '';
    // text = text.replace(/(\r\n|\n|\r)/gm, '');
    if (text.trim() !== '') {
      this.eventSendMessage.emit({ message: text, type: TYPE_MSG_TEXT });
    }
  }

  /** su mobile !!!*/
  onFileSelectedMobile(e: any) {
    console.log('controlOfMessage');
    this.chooser.getFile()
      .then(file => {
        console.log(file ? file.name : 'canceled');
      })
      .catch((error: any) => {
        console.error(error);
      });
  }

  onFileSelected(e: any) {
    console.log('Message-text-area - onFileSelected event', e);
    this.presentModal(e);

  }

  /**
   * 
   * @param e 
   */
  private async presentModal(e: any): Promise<any> {
    const that = this;
    let dataFiles = " "
    if (e.type === 'change') {

      console.log('CONVERSATION-DETAIL (MESSAGE-TEXT-AREA) presentModal change e', e);
      console.log('CONVERSATION-DETAIL (MESSAGE-TEXT-AREA) presentModal change e.target ', e.target);
      console.log('CONVERSATION-DETAIL (MESSAGE-TEXT-AREA) presentModal change e.target.files', e.target.files);
      dataFiles = e.target.files;
    } else if (e.type === 'drop') {
      dataFiles = e.dataTransfer.files
      console.log('CONVERSATION-DETAIL (MESSAGE-TEXT-AREA) presentModal drop e.dataTransfer.files', e.dataTransfer.files);
    } else {
      // paste use case
      dataFiles = e.files
      console.log('CONVERSATION-DETAIL (MESSAGE-TEXT-AREA) presentModal dataFiles when paste', dataFiles);

    }
    // console.log('presentModal e.target.files.length', e.target.files.length);

    const attributes = { files: dataFiles, enableBackdropDismiss: false };
    console.log('CONVERSATION-DETAIL (MESSAGE-TEXT-AREA) attributes', attributes);
    const modal: HTMLIonModalElement =
      await this.modalController.create({
        component: LoaderPreviewPage,
        componentProps: attributes,
        swipeToClose: false,
        backdropDismiss: true
      });
    modal.onDidDismiss().then((detail: any) => {

      console.log('presentModal onDidDismiss detail', detail);
      if (detail.data !== undefined) {
        let type = ''
        if (detail.data.fileSelected.type && detail.data.fileSelected.type.startsWith("image") && (!detail.data.fileSelected.type.includes('svg'))) {
          console.log('FIREBASE-UPLOAD presentModal onDidDismiss detail type ', detail.data.fileSelected.type);
          type = 'image'
          // if ((detail.data.fileSelected.type && detail.data.fileSelected.type.startsWith("application")) || (detail.data.fileSelected.type && detail.data.fileSelected.type === 'image/svg+xml'))
        } else {
          console.log('FIREBASE-UPLOAD presentModal onDidDismiss detail type ', detail.data.fileSelected.type);
          type = 'file'

        }

        let fileSelected = null;
        if (e.type === 'change') {
          fileSelected = e.target.files.item(0);
        } else if (e.type === 'drop') {
          console.log('FIREBASE-UPLOAD (MessageTextArea) DROP dataFiles[0]', dataFiles[0])
          fileSelected = dataFiles[0]
          // const fileList = e.dataTransfer.files;
          // console.log('FIREBASE-UPLOAD (MessageTextArea) DROP fileList', fileList)
          // const file: File = fileList[0];
          // console.log('FIREBASE-UPLOAD (MessageTextArea) DROP FILE', file)
          // const data = new ClipboardEvent('').clipboardData || new DataTransfer(); 
          // data.items.add(new File([file], file.name, { type: file.type }));
          // console.log('FIREBASE-UPLOAD (MessageTextArea) DROP DATA', data)
        } else {
          // PASTE USE CASE 
          console.log('FIREBASE-UPLOAD (MessageTextArea) PASTE  e', e)
          fileSelected = e.files.item(0)
        }

        let messageString = detail.data.messageString;
        let metadata = detail.data.metadata;
        // let type = detail.data.type;
        console.log('FIREBASE-UPLOAD (MessageTextArea) presentModal onDidDismiss detail.data', detail.data);
        console.log('FIREBASE-UPLOAD (MessageTextArea) presentModal onDidDismiss fileSelected', fileSelected);

        if (detail !== null) {
          const currentUpload = new UploadModel(fileSelected);
          console.log('FIREBASE-UPLOAD (MessageTextArea) The result: currentUpload', currentUpload);
          console.log('FIREBASE-UPLOAD (MessageTextArea) The result: CHIUDI!!!!!', detail.data);
          that.uploadService.upload(that.loggedUser.uid, currentUpload).then(downloadURL => {
            metadata.src = downloadURL;
            console.log('FIREBASE-UPLOAD (MessageTextArea) presentModal invio msg downloadURL::: ', metadata);
            console.log('FIREBASE-UPLOAD (MessageTextArea) presentModal invio msg metadata downloadURL::: ', downloadURL);
            console.log('FIREBASE-UPLOAD (MessageTextArea) presentModal invio msg type::: ', type);
            console.log('FIREBASE-UPLOAD (MessageTextArea) presentModal invio msg message::: ', messageString);
            // send message
            that.eventSendMessage.emit({ message: messageString, type: type, metadata: metadata });
            that.fileInput.nativeElement.value = '';
          }).catch(error => {
            // Use to signal error if something goes wrong.
            console.error(`FIREBASE-UPLOAD (MessageTextArea) MessageTextArea upload Failed to upload file and get link `, error);

            that.presentToast();
          });

        }
      }
    });

    return await modal.present();
  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: this.translationMap.get('UPLOAD_FILE_ERROR'),
      duration: 3000,
      color: "danger",
      cssClass: 'toast-custom-class',
    });
    toast.present();
  }

  /**
   * 
   */
  private async closeModal() {
    console.log('closeModal', this.modalController);
    await this.modalController.getTop();
    this.modalController.dismiss({ confirmed: true });
  }


}
