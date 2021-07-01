import { UserModel } from 'src/chat21-core/models/user';
import { Component, OnInit, Output, EventEmitter, Input, AfterViewInit, ViewChild, ElementRef} from '@angular/core';
import { IonTextarea } from '@ionic/angular';
import { Chooser } from '@ionic-native/chooser/ngx';
import { ModalController, ToastController  } from '@ionic/angular';

// pages
import { LoaderPreviewPage } from 'src/app/pages/loader-preview/loader-preview.page';
// services 
import { UploadService } from 'src/chat21-core/providers/abstract/upload.service';
// utils
import { TYPE_MSG_TEXT } from 'src/chat21-core/utils/constants';
// models
import { UploadModel } from 'src/chat21-core/models/upload';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-message-text-area',
  templateUrl: './message-text-area.component.html',
  styleUrls: ['./message-text-area.component.scss'],
})
export class MessageTextAreaComponent implements OnInit, AfterViewInit {

  // @ViewChild('focusInput') myInput;
  @ViewChild('textArea', { static: false }) messageTextArea
  @ViewChild('fileInput', { static: false }) fileInput: any;

  @Input() loggedUser: UserModel;
  @Input() conversationWith: string;
  @Input() tagsCannedFilter: any = [];
  @Input() events: Observable<void>;
  @Input() fileUploadAccept: string
  @Input() translationMap: Map<string, string>;
  @Output() eventChangeTextArea = new EventEmitter<object>();
  @Output() eventSendMessage = new EventEmitter<object>();


  public conversationEnabled = false;
  public messageString: string;
  public toastMsg: string;
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
  }

  ngAfterViewInit() {

    setTimeout(() => {
      console.log("MESSAGE-TEXT-AREA set focus on ", this.messageTextArea);
      // Keyboard.show() // for android
      this.messageTextArea.setFocus();
    }, 300); //a least 150ms.
  }


  ionChange(e: any) {
    console.log("CONVERSATION-DETAIL (MESSAGE-TEXT-AREA) ionChange event ", e);
    console.log("CONVERSATION-DETAIL (MESSAGE-TEXT-AREA) ionChange detail.value ", e.detail.value);
    const message = e.detail.value
    console.log("CONVERSATION-DETAIL (MESSAGE-TEXT-AREA) ionChange message ", message);
    const height = e.target.offsetHeight;

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
    console.log('FIREBASE-UPLOAD presentModal e', e);
    console.log('FIREBASE-UPLOAD presentModal e.target ', e.target);
    console.log('FIREBASE-UPLOAD presentModal e.target.files', e.target.files);
    // console.log('presentModal e.target.files.length', e.target.files.length);
    const dataFiles = e.target.files;
    const attributes = { files: dataFiles, enableBackdropDismiss: false };
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
        if (detail.data.fileSelected.type && detail.data.fileSelected.type.startsWith("image") && (!detail.data.fileSelected.type.includes('svg') )) {
          console.log('FIREBASE-UPLOAD presentModal onDidDismiss detail type ', detail.data.fileSelected.type);
          type = 'image'
          // if ((detail.data.fileSelected.type && detail.data.fileSelected.type.startsWith("application")) || (detail.data.fileSelected.type && detail.data.fileSelected.type === 'image/svg+xml'))
        } else {
          console.log('FIREBASE-UPLOAD presentModal onDidDismiss detail type ', detail.data.fileSelected.type);
          type = 'file'

        }

        let fileSelected = e.target.files.item(0);//detail.data.fileSelected;
        let messageString = detail.data.messageString;
        let metadata = detail.data.metadata;
        // let type = detail.data.type;
        console.log('FIREBASE-UPLOAD (MessageTextArea) presentModal onDidDismiss detail.data', detail.data);
        console.log('FIREBASE-UPLOAD (MessageTextArea) presentModal onDidDismiss fileSelected', fileSelected);

        if (detail !== null) {
          const currentUpload = new UploadModel(fileSelected);
          console.log('FIREBASE-UPLOAD (MessageTextArea) The result: currentUpload', currentUpload);
          console.log('FIREBASE-UPLOAD (MessageTextArea) The result: CHIUDI!!!!!', detail.data);
          that.uploadService.upload(that.loggedUser.uid ,currentUpload).then(downloadURL => {
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
