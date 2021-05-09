import { Component, OnInit, Output, EventEmitter, Input, AfterViewInit , ViewChild, ElementRef } from '@angular/core';
import { IonTextarea } from '@ionic/angular';
import { Chooser } from '@ionic-native/chooser/ngx';
import { ModalController } from '@ionic/angular';

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

  // set textArea(element: ElementRef<HTMLInputElement>) {
  //   if(element) {
  //     console.log('MessageTextAreaComponent element',element)
  //     // element.nativeElement.focus()
  //     element.nativeElement.focus()
  //   }
  //  }

  @Output() eventChangeTextArea = new EventEmitter<object>();
  @Output() eventSendMessage = new EventEmitter<object>();


  @Input() conversationWith: string;
  @Input() tagsCannedFilter: any = [];
  @Input() events: Observable<void>;

  public conversationEnabled = false;
  public messageString: string;

  TYPE_MSG_TEXT = TYPE_MSG_TEXT;

  constructor(
    public chooser: Chooser,
    public modalController: ModalController,
    public uploadService: UploadService
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

  // ngDoCheck() {
  //   console.log("CONVERSATION-DETAIL (MESSAGE-TEXT-AREA) tagsCannedFilter ", this.tagsCannedFilter);
  // }

  // !!!!! NOT used
  // onChange(e: any) {
  //   console.log("CONVERSATION-DETAIL (MESSAGE-TEXT-AREA) onChange event ", e);
  //   const codeChar = e.detail.data;

  //   let message = e.detail.target.innerHTML;
  //   console.log("CONVERSATION-DETAIL (MESSAGE-TEXT-AREA) onChange message  (e.detail.target.innerHTML) ", message);
  //   console.log("CONVERSATION-DETAIL (MESSAGE-TEXT-AREA) onChange message  (e.detail.data) ", e.detail.data);
  //   if (e.detail.data) {
  //     message += e.detail.data;
  //   }
  //   const height = e.detail.target.offsetHeight;
  //   // console.log('onChange ************** event:: ', message);
  //   if (codeChar === 10) {
  //     console.log('premuto invio ');
  //   } else {
  //     try {
  //       if (message.trim().length > 0) {
  //         this.conversationEnabled = true;
  //       } else {
  //         this.conversationEnabled = false;
  //       }
  //     } catch (err) {
  //       this.conversationEnabled = false;
  //     }
  //     this.eventChangeTextArea.emit({ msg: message, offsetHeight: height });
  //   }
  // }

  ionChange(e: any) {
    console.log("CONVERSATION-DETAIL (MESSAGE-TEXT-AREA) ionChange event ", e);
    console.log("CONVERSATION-DETAIL (MESSAGE-TEXT-AREA) ionChange detail.value ", e.detail.value);
    const message = e.detail.value
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
  private setSubscriptions() {
    const that = this;
    const subscribeBSStateUpload = this.uploadService.BSStateUpload.subscribe((data: any) => {
      console.log('***** BSStateUpload *****', data);
      if (data) {
        let message = data.message;
        let type_message = data.type_message;
        let metadata = data.metadata;
        console.log('***** message *****', message);
        console.log('***** type_message *****', type_message);
        console.log('***** metadata *****', metadata);
        //this.eventSendMessage.emit({ message: messageString, type: TYPE_MSG_TEXT });
      }
    });
  }

  /**
   * 
   * @param event
   */
  // public messageChange(event) {
  //   const that = this;
  //   try {
  //     if (event) {
  //       console.log("event.value:: ", event);
  //       var str = event.value;
  //       that.setWritingMessages(str);
  //       setTimeout(function () {
  //         var pos = str.lastIndexOf("/");
  //         console.log("str:: ", str);
  //         console.log("pos:: ", pos);
  //         if(pos >= 0 ) {
  //           // && that.tagsCanned.length > 0
  //           var strSearch = str.substr(pos+1);
  //           that.loadTagsCanned(strSearch);
  //           //that.showTagsCanned(strSearch);
  //           //that.loadTagsCanned(strSearch);
  //         } else {
  //           that.tagsCannedFilter = [];
  //         }
  //       }, 300);
  //       that.resizeTextArea();
  //     }
  //   } catch (err) {
  //     console.log("error: ", err)
  //   }    
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
    console.log('sendMessage', text);
    console.log('sendMessage conve width', this.conversationWith);
    this.messageString = '';
    text = text.replace(/(\r\n|\n|\r)/gm, '');
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


  hasClickedUploadImage() {
    console.log('Message-text-area - hasClickedUploadImage conversationWith', this.conversationWith);
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
    console.log('presentModal e', e);
    console.log('presentModal e.target ', e.target);
    console.log('presentModal e.target.files', e.target.files);
    console.log('presentModal e.target.files.length', e.target.files.length);
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
      console.log('presentModal onDidDismiss detail type ', detail.data.fileSelected.type);
      let type = ''
      if (detail.data.fileSelected.type && detail.data.fileSelected.type.startsWith("image")) {
        type = 'image'
      } else if ((detail.data.fileSelected.type && detail.data.fileSelected.type.startsWith("application"))) {
        type = 'file'

      }

      let fileSelected = e.target.files.item(0);//detail.data.fileSelected;
      let messageString = detail.data.messageString;
      let metadata = detail.data.metadata;
      // let type = detail.data.type;
      console.log('presentModal onDidDismiss detail.data', detail.data);
      console.log('presentModal onDidDismiss fileSelected', fileSelected);
      if (detail !== null) {
        const currentUpload = new UploadModel(fileSelected);
        console.log('The result: CHIUDI!!!!!', detail.data);
        that.uploadService.upload(currentUpload).then(downloadURL => {
          metadata.src = downloadURL;
          console.log('presentModal invio msg metadata::: ', metadata);
          console.log('presentModal invio msg metadata downloadURL::: ', downloadURL);
          console.log('presentModal invio msg type::: ', type);
          console.log('presentModal invio msg message::: ', messageString);
          // send message
          that.eventSendMessage.emit({ message: messageString, type: type, metadata: metadata });
        }).catch(error => {
          // Use to signal error if something goes wrong.
          console.error(`MessageTextArea component::uploadSingle:: Failed to upload file and get link `, error);
        });

      }
    });
    return await modal.present();
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
