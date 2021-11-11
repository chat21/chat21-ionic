import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MessageModel } from 'src/chat21-core/models/message';
import { MAX_WIDTH_IMAGES } from 'src/chat21-core/utils/constants';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { isFile, isFrame, isImage } from 'src/chat21-core/utils/utils-message';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
@Component({
  selector: 'chat-bubble-message',
  templateUrl: './bubble-message.component.html',
  styleUrls: ['./bubble-message.component.scss']
})
export class BubbleMessageComponent implements OnInit, OnChanges {

  @Input() message: MessageModel;
  @Input() textColor: string;
  @Output() onBeforeMessageRender = new EventEmitter();
  @Output() onAfterMessageRender = new EventEmitter();
  @Output() onImageRendered = new EventEmitter<boolean>()
  isImage = isImage;
  isFile = isFile;
  isFrame = isFrame;

  public browserLang: string;

  tooltipOptions = {
    'show-delay': 500,
    'tooltip-class': 'chat-tooltip',
    'theme': 'light',
    'shadow': false,
    'hide-delay-mobile': 0,
    'hideDelayAfterClick': 3000,
    'hide-delay': 200
  };

  private logger: LoggerService = LoggerInstance.getInstance()
  constructor(
    public sanitizer: DomSanitizer,
    private translate: TranslateService) {
    // console.log('BUBBLE-MSG Hello !!!!')
  }

  ngOnInit() {
    this.browserLang = this.translate.getBrowserLang();
    // console.log('BUBBLE-MSG ngOnInit browserLang ', this.browserLang)
    if (this.browserLang) {
      if (this.browserLang === 'it') {
        // console.log('BUBBLE-MSG browserLang ', this.browserLang)
        // moment.locale('it')

        moment.locale('it', {
          calendar: {
            lastDay: '[Ieri alle] LT',
            sameDay: '[Oggi alle] LT',
            nextDay: '[Domani alle] LT',
            lastWeek: '[Ultimo] dddd [alle] LT',
            nextWeek: 'dddd [alle] LT',
            sameElse: 'lll'
          }
        });

      } else {
        // console.log('BUBBLE-MSG browserLang ', this.browserLang)
        // moment.locale('en')

        moment.locale('en', {
          calendar: {
            lastDay: '[Yesterday at] LT',
            sameDay: '[Today at] LT',
            nextDay: '[Tomorrow at] LT',
            lastWeek: '[last] dddd [at] LT',
            nextWeek: 'dddd [at] LT',
            sameElse: 'lll'
          }
        });
      }
    }



    // const yesterday = moment().subtract(1, 'day')
    // console.log('BUBBLE-MSG yesterday ', yesterday)

  }

  ngOnChanges() {
    // console.log('BUBBLE-MSG Hello !!!! this.message ',  this.message)
    if (this.message && this.message.metadata && typeof this.message.metadata === 'object') {
      this.getMetadataSize(this.message.metadata)
      // console.log('BUBBLE-MSG ngOnChanges message > metadata', this.message.metadata)
    }

  }


  /**
   *
   * @param message
   */
  // getMetadataSize(metadata): any {
  //   if(metadata.width === undefined){
  //     metadata.width= MAX_WIDTH_IMAGES
  //   }
  //   if(metadata.height === undefined){
  //     metadata.height = MAX_WIDTH_IMAGES
  //   }
  //   // const MAX_WIDTH_IMAGES = 300;
  //   const sizeImage = {
  //       width: metadata.width,
  //       height: metadata.height
  //   };
  //   //   that.g.wdLog(['message::: ', metadata);
  //   if (metadata.width && metadata.width > MAX_WIDTH_IMAGES) {
  //       const rapporto = (metadata['width'] / metadata['height']);
  //       sizeImage.width = MAX_WIDTH_IMAGES;
  //       sizeImage.height = MAX_WIDTH_IMAGES / rapporto;
  //   }
  //   return sizeImage; // h.toString();
  // }

  getMetadataSize(metadata): any {
    if (metadata.width === undefined) {
      metadata.width = MAX_WIDTH_IMAGES
    }
    if (metadata.height === undefined) {
      metadata.height = MAX_WIDTH_IMAGES
    }

    if (metadata.width && metadata.width < MAX_WIDTH_IMAGES) {
      if (metadata.width <= 55) {
        const ratio = (metadata['width'] / metadata['height']);
        metadata.width = 200;
        metadata.height = 200 / ratio;
      } else if (metadata.width > 55) {
        metadata.width = this.message.metadata.width;
        metadata.height = this.message.metadata.height;
      }
    } else if (metadata.width && metadata.width > MAX_WIDTH_IMAGES) {
      const ratio = (metadata['width'] / metadata['height']);
      metadata.width = MAX_WIDTH_IMAGES;
      metadata.height = MAX_WIDTH_IMAGES / ratio;
    }
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
        that.logger.error('[BUBBLE-MESSAGE] handleTooltipEvents >>>> Error :' + err);
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

  returnOnBeforeMessageRender(event) {
    const messageOBJ = { message: this.message, sanitizer: this.sanitizer, messageEl: event.messageEl, component: event.component }
    this.onBeforeMessageRender.emit(messageOBJ)
  }

  returnOnAfterMessageRender(event) {
    const messageOBJ = { message: this.message, sanitizer: this.sanitizer, messageEl: event.messageEl, component: event.component }
    this.onAfterMessageRender.emit(messageOBJ)
  }

  onImageRenderedFN(event) {
    this.onImageRendered.emit(event)
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
