import { Component, EventEmitter, Input, OnChanges, OnInit, Output, Sanitizer } from '@angular/core';

@Component({
  selector: 'tiledeskwidget-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss']
})
export class TextComponent implements OnInit, OnChanges {

  @Input() text: string;
  @Input() color: string;
  @Output() onBeforeMessageRender = new EventEmitter();
  @Output() onAfterMessageRender = new EventEmitter();
  
  constructor() { }

  ngOnInit() {
  }


  printMessage(text, messageEl, component) {
    // console.log('TEXT-COMP text', text) 
    const messageOBJ = { messageEl: messageEl, component: component}
    this.onBeforeMessageRender.emit(messageOBJ)
    const messageText = text;
    this.onAfterMessageRender.emit(messageOBJ)
    // this.triggerBeforeMessageRender(message, messageEl, component);
    // const messageText = message.text;
    // this.triggerAfterMessageRender(message, messageEl, component);
    return messageText;
  }

  ngOnChanges() {
 console.log('TEXT-COMP text', this.text) 

  }

}
