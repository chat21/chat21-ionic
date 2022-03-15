import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MessageModel } from 'src/chat21-core/models/message';
import { MAX_WIDTH_IMAGES } from 'src/chat21-core/utils/constants';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { isFile, isFrame, isImage } from 'src/chat21-core/utils/utils-message';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { TranslateService } from '@ngx-translate/core';
import { TiledeskAuthService } from 'src/chat21-core/providers/tiledesk/tiledesk-auth.service';
import * as moment from 'moment';
import { CreateCannedResponsePage } from 'src/app/pages/create-canned-response/create-canned-response.page'
import { ModalController } from '@ionic/angular';
@Component({
  selector: 'chat-bubble-message',
  templateUrl: './bubble-message.component.html',
  styleUrls: ['./bubble-message.component.scss']
})
export class BubbleMessageComponent implements OnInit, OnChanges {

  @Input() message: MessageModel;
  @Input() textColor: string;
  @Input() areVisibleCAR: boolean;
  @Input() support_mode: boolean;
  @Output() onBeforeMessageRender = new EventEmitter();
  @Output() onAfterMessageRender = new EventEmitter();
  @Output() onImageRendered = new EventEmitter<boolean>()
  isImage = isImage;
  isFile = isFile;
  isFrame = isFrame;
  @Input() addAsCannedResponseTooltipText : string;
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
    private translate: TranslateService,
    public tiledeskAuthService: TiledeskAuthService,
    public modalController: ModalController,
    ) {
    // console.log('BUBBLE-MSG Hello !!!!')
  }

  ngOnInit() {

    this.setMomentLocale()
    // this.browserLang = this.translate.getBrowserLang();
  
    // if (this.browserLang) {
    //   if (this.browserLang === 'it') {


    //     moment.locale('it', {
    //       calendar: {
    //         lastDay: '[Ieri alle] LT',
    //         sameDay: '[Oggi alle] LT',
    //         nextDay: '[Domani alle] LT',
    //         lastWeek: '[Ultimo] dddd [alle] LT',
    //         nextWeek: 'dddd [alle] LT',
    //         sameElse: 'lll'
    //       }
    //     });

    //   } else {
    //     moment.locale('en', {
    //       calendar: {
    //         lastDay: '[Yesterday at] LT',
    //         sameDay: '[Today at] LT',
    //         nextDay: '[Tomorrow at] LT',
    //         lastWeek: '[last] dddd [at] LT',
    //         nextWeek: 'dddd [at] LT',
    //         sameElse: 'lll'
    //       }
    //     });
    //   }
    // }

  }


  setMomentLocale() {
    this.browserLang = this.translate.getBrowserLang();
    const currentUser = this.tiledeskAuthService.getCurrentUser();
    this.logger.log('[BUBBLE-MESSAGE] - ngOnInit - currentUser ', currentUser)
    let currentUserId = ''
    if (currentUser) {
      currentUserId = currentUser.uid
      this.logger.log('[BUBBLE-MESSAGE] - ngOnInit - currentUserId ', currentUserId)
    }

    const stored_preferred_lang = localStorage.getItem(currentUserId + '_lang');
    this.logger.log('[BUBBLE-MESSAGE] stored_preferred_lang: ', stored_preferred_lang);


    let chat_lang = ''
    if (this.browserLang && !stored_preferred_lang) {
      chat_lang = this.browserLang
    } else if (this.browserLang && stored_preferred_lang) {
      chat_lang = stored_preferred_lang
    }
    moment.locale(chat_lang , {
      calendar: {
        sameElse: 'LLLL'
      }
    });
    // this.translate.getTranslation(chat_lang).subscribe((labels: string) => {
    //   console.log('[BUBBLE-MESSAGE] translations: ', labels);
    // });
  }

  ngOnChanges() {
    console.log('BUBBLE-MSG Hello !!!! this.message ',  this.message)
    console.log('BUBBLE-MSG ngOnChanges areVisibleCAR', this.areVisibleCAR)
      console.log('BUBBLE-MSG ngOnChanges support_mode', this.support_mode)
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
          if (item && !item.classList.contains('tooltip-show')) {
            item.classList.add('tooltip-show');
          }
          setTimeout(function () {
            if (item && item.classList.contains('tooltip-show')) {
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

  async presentCreateCannedResponseModal(): Promise<any> {
    console.log('[BUBBLE-MESSAGE] PRESENT CREATE CANNED RESPONSE MODAL ')
    const attributes = {
       message: this.message,
    }
    const modal: HTMLIonModalElement = await this.modalController.create({
      component: CreateCannedResponsePage,
      componentProps: attributes,
      swipeToClose: false,
      backdropDismiss: false,
    })
    modal.onDidDismiss().then((dataReturned: any) => {
      // 
      this.logger.log('[BUBBLE-MESSAGE] ', dataReturned.data)
     
      // if (dataReturned.data && dataReturned.data.selectedRequester) {
      //   this.selectedRequester = dataReturned.data.selectedRequester
      // }

      // if (dataReturned.data && dataReturned.data.requester_type) {
      //   this.requester_type = dataReturned.data.requester_type
      // }

      // if (dataReturned.data && dataReturned.data.requester_id) {
      //  const requester_id = dataReturned.data.requester_id;
      //  this.logger.log('[CREATE-TICKET] REQUESTER ID RERETURNED FROM CREATE REQUESTER', requester_id)
      //  this.id_for_view_requeter_dtls = requester_id

      // }

      // if ( dataReturned.data && dataReturned.data.updatedProjectUserAndLeadsArray) {
      //   this.projectUserAndLeadsArray = dataReturned.data.updatedProjectUserAndLeadsArray
      //   this.projectUserAndLeadsArray = this.projectUserAndLeadsArray.slice(0)
      // }
    })

    return await modal.present()
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
