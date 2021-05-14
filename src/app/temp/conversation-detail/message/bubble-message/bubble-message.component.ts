import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MessageModel } from 'src/chat21-core/models/message';
import { MAX_WIDTH_IMAGES} from 'src/chat21-core/utils/constants';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { isFile, isFrame, isImage } from 'src/chat21-core/utils/utils-message';
@Component({
  selector: 'tiledeskwidget-bubble-message',
  templateUrl: './bubble-message.component.html',
  styleUrls: ['./bubble-message.component.scss']
})
export class BubbleMessageComponent implements OnInit {

  @Input() message: MessageModel;
  @Input() textColor: string;
  @Output() onBeforeMessageRender = new EventEmitter();
  @Output() onAfterMessageRender = new EventEmitter();

  isImage = isImage;
  isFile = isFile;
  isFrame = isFrame;
  
  tooltipOptions = {
    'show-delay': 1500,
    'tooltip-class': 'chat-tooltip',
    'theme': 'light',
    'shadow': false,
    'hide-delay-mobile': 0,
    'hideDelayAfterClick': 3000,
    'hide-delay': 200
  };

  constructor(private logger: LoggerService,
              public sanitizer: DomSanitizer) { }

  ngOnInit() {
  }

  /**
   *
   * @param message
   */
  getMetadataSize(metadata): any {
    if(metadata.width === undefined){
      metadata.width= MAX_WIDTH_IMAGES
    }
    if(metadata.height === undefined){
      metadata.height = MAX_WIDTH_IMAGES
    }
    // const MAX_WIDTH_IMAGES = 300;
    const sizeImage = {
        width: metadata.width,
        height: metadata.height
    };
    //   that.g.wdLog(['message::: ', metadata);
    if (metadata.width && metadata.width > MAX_WIDTH_IMAGES) {
        const rapporto = (metadata['width'] / metadata['height']);
        sizeImage.width = MAX_WIDTH_IMAGES;
        sizeImage.height = MAX_WIDTH_IMAGES / rapporto;
    }
    return sizeImage; // h.toString();
  }

  /**
  * function customize tooltip
  */
 handleTooltipEvents(event) {
  const that = this;
  const showDelay = this.tooltipOptions['show-delay'];
  setTimeout(function () {
    try {
      const domRepresentation = document.getElementsByClassName('chat-tooltip');
      if (domRepresentation) {
        const item = domRepresentation[0] as HTMLInputElement;
        if (!item.classList.contains('tooltip-show')) {
          item.classList.add('tooltip-show');
        }
        setTimeout(function () {
          if (item.classList.contains('tooltip-show')) {
            item.classList.remove('tooltip-show');
          }
        }, that.tooltipOptions['hideDelayAfterClick']);
      }
    } catch (err) {
        that.logger.printError('BUBBLE MESSAGE handleTooltipEvents >>>> Error :' + err);
    }
  }, showDelay);
}

  // ========= begin:: event emitter function ============//

  // returnOpenAttachment(event: String) {
  //   this.onOpenAttachment.emit(event)
  // }

  // /** */
  // returnClickOnAttachmentButton(event: any) {
  //   this.onClickAttachmentButton.emit(event)
  // }

  returnOnBeforeMessageRender(event){
    const messageOBJ = { message: this.message, sanitizer: this.sanitizer, messageEl: event.messageEl, component: event.component}
    this.onBeforeMessageRender.emit(messageOBJ)
  }

  returnOnAfterMessageRender(event){
    const messageOBJ = { message: this.message, sanitizer: this.sanitizer, messageEl: event.messageEl, component: event.component}
    this.onAfterMessageRender.emit(messageOBJ)
  }

  // printMessage(message, messageEl, component) {
  //   const messageOBJ = { message: message, sanitizer: this.sanitizer, messageEl: messageEl, component: component}
  //   this.onBeforeMessageRender.emit(messageOBJ)
  //   const messageText = message.text;
  //   this.onAfterMessageRender.emit(messageOBJ)
  //   // this.triggerBeforeMessageRender(message, messageEl, component);
  //   // const messageText = message.text;
  //   // this.triggerAfterMessageRender(message, messageEl, component);
  //   return messageText;
  // }

  // ========= END:: event emitter function ============//


}
