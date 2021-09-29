import { Component, EventEmitter, Input, OnChanges, OnInit, Output, Sanitizer } from '@angular/core';
import { MAX_WIDTH_IMAGES } from 'src/chat21-core/utils/constants';
@Component({
  selector: 'chat-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss']
})
export class TextComponent implements OnInit {

  @Input() text: string;
  @Input() color: string;
  @Output() onBeforeMessageRender = new EventEmitter();
  @Output() onAfterMessageRender = new EventEmitter();

  @Input() message: any;

  public media_width: number;
  public media_height: number;

  constructor() { }

  ngOnInit() {
  }


  printMessage(text, messageEl, component) {
    const messageOBJ = { messageEl: messageEl, component: component }
    this.onBeforeMessageRender.emit(messageOBJ)
    const messageText = text;
    this.onAfterMessageRender.emit(messageOBJ)
    // this.triggerBeforeMessageRender(message, messageEl, component);
    // const messageText = message.text;
    // this.triggerAfterMessageRender(message, messageEl, component);
    return messageText;
  }

  ngOnChanges() {
    if (this.message.type === 'image') {
      // console.log('TextComponent message ', this.message)
      if (this.message.metadata.width && this.message.metadata.width > MAX_WIDTH_IMAGES) {

        const ratio = (this.message.metadata['width'] / this.message.metadata['height']);

        this.media_width = MAX_WIDTH_IMAGES;
        this.media_height = MAX_WIDTH_IMAGES / ratio;

        // console.log('TextComponent media_width ', this.media_width, ' media_height' ,  this.media_height)
      } else {
        this.media_width = this.message.metadata.width;
        this.media_height = this.message.metadata.height;
        // console.log('TextComponent media_width ', this.media_width, ' media_height' ,  this.media_height)
      }
    }
  }

}
