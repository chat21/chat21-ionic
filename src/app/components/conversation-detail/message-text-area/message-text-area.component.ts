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
  @Output() eventChangeTextArea = new EventEmitter<IonTextarea>();
  @Output() eventSendMessage = new EventEmitter<object>();

  public conversationEnabled = false;
  public messageString: string;

  TYPE_MSG_TEXT = TYPE_MSG_TEXT;

  constructor(
  ) { }

  ngOnInit() {
  }

  onChange(e: any) {
    // console.log('onChange ************** event:: ', e.detail.value);

    const lastChar = e.target.textContent.substr(-1);
    const codeChar = lastChar.charCodeAt(0);
    // console.log('lastChar', lastChar.charCodeAt(0));
    if ( codeChar === 10 ) {
      console.log('premuto invio ');
    } else {
      try {
        const text = e.target.textContent.trim();
        if ( text.length > 0 ) {
          this.conversationEnabled = true;
        } else {
          this.conversationEnabled = false;
        }
      } catch (err) {
        this.conversationEnabled = false;
      }
      this.eventChangeTextArea.emit(e);
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
