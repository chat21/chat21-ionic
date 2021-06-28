
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { MessageModel } from 'src/chat21-core/models/message';
import { replaceEndOfLine } from 'src/chat21-core/utils/utils';

@Component({
  selector: 'tiledeskwidget-info-message',
  templateUrl: './info-message.component.html',
  styleUrls: ['./info-message.component.scss']
})
export class InfoMessageComponent implements OnInit, OnChanges {

  @Input() message: MessageModel

 public message_text: string 
  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {

    console.log('InfoMessageComponent message ', this.message)
    
         // Fixes the bug: if a snippet of code is pasted and sent it is not displayed correctly info message
         if (this.message && this.message.text) {
          var regex = /<br\s*[\/]?>/gi;
          this.message.text = this.message.text.replace(regex, "\n")
          // this.message.text = replaceEndOfLine(this.message.text);
          console.log('InfoMessageComponent message .text  ', this.message.text )
        }
  }

}
