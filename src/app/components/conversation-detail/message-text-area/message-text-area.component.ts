import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { IonTextarea } from '@ionic/angular';
// utils
import { TYPE_MSG_TEXT } from 'src/app/utils/constants';

@Component({
  selector: 'app-message-text-area',
  templateUrl: './message-text-area.component.html',
  styleUrls: ['./message-text-area.component.scss'],
})
export class MessageTextAreaComponent implements OnInit {
  @Output() eventChangeTextArea = new EventEmitter<object>();
  @Output() eventSendMessage = new EventEmitter<object>();

  public conversationEnabled = false;
  public messageString: string;

  TYPE_MSG_TEXT = TYPE_MSG_TEXT;

  constructor(
  ) { }

  ngOnInit() {
  }

  onChange(e: any) {
    const codeChar = e.detail.data;
    const message = e.detail.target.innerHTML + e.detail.data;
    const height = e.detail.target.offsetHeight;
    console.log('onChange ************** event:: ', message);
    if ( codeChar === 10 ) {
      console.log('premuto invio ');
    } else {
      try {
        if ( message.trim().length > 0 ) {
          this.conversationEnabled = true;
        } else {
          this.conversationEnabled = false;
        }
      } catch (err) {
        this.conversationEnabled = false;
      }
      this.eventChangeTextArea.emit({ msg: message, offsetHeight: height } );
    }
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
    if ( e.inputType === 'insertLineBreak' && message === '' ) {
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
    this.messageString = '';
    text = text.replace(/(\r\n|\n|\r)/gm, '');
    if (text.trim() !== '') {
      this.eventSendMessage.emit({ message: text, type: TYPE_MSG_TEXT });
    }
  }

  /** */
  controlOfMessage(messageString: string) {

  }

}
