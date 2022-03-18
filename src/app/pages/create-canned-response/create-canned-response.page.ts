import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { TiledeskAuthService } from 'src/chat21-core/providers/tiledesk/tiledesk-auth.service';
import { TiledeskService } from 'src/app/services/tiledesk/tiledesk.service';
import { MenuController } from '@ionic/angular';
import { EventsService } from 'src/app/services/events-service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-create-canned-response',
  templateUrl: './create-canned-response.page.html',
  styleUrls: ['./create-canned-response.page.scss'],
})
export class CreateCannedResponsePage implements OnInit {

  public canned_response_title: string;
  public canned_response_message: string;
  validations_form: FormGroup;
  @Input() message: any
  @Input() conversationWith: string;
  logger: LoggerService = LoggerInstance.getInstance();

  prjctID: string;
  tiledeskToken: string;
  showSpinnerCreateCannedResponse: boolean = false;
  addWhiteSpaceBefore: boolean;
  mouseOverBtnAddRecipientNamePlaceholder: boolean = false;
  mouseOverBtnAddAgentNamePlaceholder: boolean = false;
  conversation_id: string
  // public conversationWith: string;
  constructor(
    public modalController: ModalController,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    public tiledeskAuthService: TiledeskAuthService,
    public tiledeskService: TiledeskService,
    private menu: MenuController,
    public events: EventsService,
    private route: ActivatedRoute,
  ) {
    //   this.route.paramMap.subscribe((params) => {
    //  console.log('[CONVS-DETAIL] - constructor -> params: ', params)
    //   this.conversationWith = params.get('IDConv')


    // })
  }



  ngOnInit() {
    // this.getCurrentProjectId();
    // console.log('[CREATE-CANNED-RES] - conversationWith ', this.conversationWith)
    //  console.log('[CREATE-CANNED-RES] - message ', this.message)
    if (this.message) {
      this.conversation_id = this.message.recipient
      this.logger.log('[CREATE-CANNED-RES] - conversationWith get from @input message (passed by bubble-message)', this.conversation_id)
    } else {
      this.logger.log('[CREATE-CANNED-RES] - @input message is UNDEFINED')
    }
    if (this.conversationWith) {
      this.conversation_id = this.conversationWith;
      this.logger.log('[CREATE-CANNED-RES] - conversationWith get from @input conversationWith (passed by conversation detail) ', this.conversation_id)
    } else {
      this.logger.log('[CREATE-CANNED-RES] - @input conversationWith is UNDEFINED')
    }

    this.tiledeskToken = this.tiledeskAuthService.getTiledeskToken()
    this.logger.log('[CREATE-CANNED-RES] tiledeskToken ', this.tiledeskToken)
    this.getCurrentProjectId(this.conversation_id, this.tiledeskToken);

    // const stored_project = localStorage.getItem('last_project')
    // const storedPrjctObjct = JSON.parse(stored_project)
    // this.logger.log('[CREATE-CANNED-RES] storedPrjctObjct ', storedPrjctObjct)
    // if (storedPrjctObjct) {
    //   this.prjctID = storedPrjctObjct.id_project.id
    //   this.logger.log('[CREATE-CANNED-RES] this.prjctID ', this.prjctID)
    // }
   


    this.buildForm()
  }

  getCurrentProjectId(conversation_id, tiledeskToken) {
    const conversationWith_segments = conversation_id.split('-')
    // Removes the last element of the array if is = to the separator
    if (
      conversationWith_segments[conversationWith_segments.length - 1] === ''
    ) {
      conversationWith_segments.pop()
    }

    if (conversationWith_segments.length === 4) {
      const lastArrayElement = conversationWith_segments[conversationWith_segments.length - 1]
      this.logger.log('[CREATE-CANNED-RES] - lastArrayElement ', lastArrayElement)
      this.logger.log('[CREATE-CANNED-RES]- lastArrayElement length', lastArrayElement.length)
      if (lastArrayElement.length !== 32) {
        conversationWith_segments.pop()
      }
    }

    this.logger.log('[CREATE-CANNED-RES] - loadTagsCanned conversationWith_segments ', conversationWith_segments)
    // let projectId = ''

    if (conversationWith_segments.length === 4) {
      this.prjctID = conversationWith_segments[2]
      this.logger.log('[CREATE-CANNED-RES] - loadTagsCanned projectId ', this.prjctID)
    } else {
      this.getProjectIdByConversationWith(conversation_id, tiledeskToken)
    }
  }

  getProjectIdByConversationWith(conversationWith: string, tiledeskToken: string) {
    // const tiledeskToken = this.tiledeskAuthService.getTiledeskToken()

    this.tiledeskService
      .getProjectIdByConvRecipient(tiledeskToken, conversationWith)
      .subscribe(
        (res) => {
          this.logger.log('[CREATE-CANNED-RES] - GET PROJECTID BY CONV RECIPIENT RES', res)
          if (res) {
            this.prjctID = res.id_project
            this.logger.log('[CREATE-CANNED-RES] - GET PROJECTID BY CONV RECIPIENT projectId ', this.prjctID)

          }
        },
        (error) => {
          this.logger.error('[CREATE-CANNED-RES] - GET PROJECTID BY CONV RECIPIENT - ERROR  ', error)
        },
        () => {
          this.logger.log('[CREATE-CANNED-RES] - GET PROJECTID BY CONV RECIPIENT * COMPLETE *',)
        },
      )
  }


  buildForm() {
    this.validations_form = this.formBuilder.group({
      title: new FormControl('', Validators.required),
      message: new FormControl('', Validators.required),
    });

    this.setValues()
  }

  setValues() {
    if (this.message && this.message.text) {
      let cannedTitle = ''
      const titleMaxCharacters = 37
      if (this.message.text.length > titleMaxCharacters) {
        cannedTitle = this.message.text.substring(0, titleMaxCharacters) + '...'
      } else {
        cannedTitle = this.message.text
      }
      this.logger.log('[CREATE-CANNED-RES] - cannedTitle  ', cannedTitle.trim())
      this.logger.log('[CREATE-CANNED-RES] - cannedMsg  ', this.message.text.trim())
      this.validations_form.controls['title'].setValue(cannedTitle);
      this.validations_form.controls['message'].setValue(this.message.text);
    }
  }


  validation_messages = {
    'title': [
      { type: 'required', message: this.translate.instant('TitleIsRequired') }
    ],
    'message': [
      { type: 'required', message: this.translate.instant('MessageIsRequired') }
    ],
  };

  onSubmit(values) {
    this.logger.log('[CREATE-CANNED-RES] ON SUBMIT VALUES', values);
    this.canned_response_title = values.title
    this.canned_response_message = values.message
    this.logger.log('[CREATE-CANNED-RES] ON SUBMIT canned_response_title', this.canned_response_title);
    this.logger.log('[CREATE-CANNED-RES] ON SUBMIT canned_response_title', this.canned_response_message);
    this.createResponse(this.canned_response_message, this.canned_response_title)
  }

  createResponse(canned_response_message, canned_response_title) {
    this.showSpinnerCreateCannedResponse = true;
    this.logger.log('[CREATE-CANNED-RES] - CREATE CANNED RESP - MSG ', canned_response_message);
    this.logger.log('[CREATE-CANNED-RES] - CREATE CANNED RESP - TITLE ', canned_response_title);

    this.tiledeskService.createCannedResponse(canned_response_message.trim(), canned_response_title.trim(), this.prjctID, this.tiledeskToken)
      .subscribe((responses: any) => {
        this.logger.log('[CREATE-CANNED-RES] - CREATE CANNED RESP - RES ', responses);

      }, (error) => {
        this.logger.error('[CREATE-CANNED-RES]- CREATE CANNED RESP - ERROR  ', error);
        this.showSpinnerCreateCannedResponse = false;
      }, () => {
        this.logger.log('[CREATE-CANNED-RES] - CREATE CANNED RESP * COMPLETE *');
        this.showSpinnerCreateCannedResponse = false;
        this.closeModalCreateCannedResponseModal()
        this.events.publish('newcannedresponse:created', true);
      });
  }

  openAddPersonalisationMenu() {
    this.menu.enable(true, 'custom');
    this.menu.open('custom');
  }

  addRecipientNamePlaceholderToTheMsg() {
    this.menu.close('custom')
    this.menu.enable(false, 'custom');
    this.insertCustomField('$recipient_name')
  }

  onOverBtnAddRecipientNamePlaceholder() {
    this.mouseOverBtnAddRecipientNamePlaceholder = true;
    this.logger.log('[CREATE-CANNED-RES] - isOverRecipientName ', this.mouseOverBtnAddRecipientNamePlaceholder);
  }

  onOutBtnAddRecipientNamePlaceholder() {
    this.mouseOverBtnAddRecipientNamePlaceholder = false;
    this.logger.log('[CREATE-CANNED-RES] - isOutRecipientName ', this.mouseOverBtnAddRecipientNamePlaceholder);
  }

  addAgentNamePlaceholderToTheMsg() {
    this.menu.close('custom')
    this.menu.enable(false, 'custom');
    this.insertCustomField('$agent_name')
  }

  onOverBtnAddAgentNamePlaceholder() {
    this.mouseOverBtnAddAgentNamePlaceholder = true;
    this.logger.log('[CREATE-CANNED-RES] - isOverAgentName ', this.mouseOverBtnAddAgentNamePlaceholder);
  }

  onOutBtnAddAgentNamePlaceholder() {
    this.mouseOverBtnAddAgentNamePlaceholder = false;
    this.logger.log('[CREATE-CANNED-RES] - isOutAgentName ', this.mouseOverBtnAddAgentNamePlaceholder);
  }





  cannedResponseMessageChanged($event) {
    this.logger.log('[CREATE-CANNED-RES] - ON MSG CHANGED ', $event);

    if (/\s$/.test($event)) {
      this.logger.log('[CREATE-CANNED-RES] - ON MSG CHANGED - string contains space at last');
      this.addWhiteSpaceBefore = false;
    } else {
      this.logger.log('[CREATE-CANNED-RES] - ON MSG CHANGED - string does not contain space at last');
      // IS USED TO ADD A WHITE SPACE TO THE 'PERSONALIZATION' VALUE IF THE STRING DOES NOT CONTAIN SPACE AT LAST
      this.addWhiteSpaceBefore = true;
    }

  }

  insertCustomField(customfieldValue: string) {
    const elTextarea = <HTMLElement>document.querySelector('.canned-response-texarea');
    this.logger.log('[CREATE-CANNED-RES] - GET TEXT AREA - elTextarea ', elTextarea);
    if (elTextarea) {
      this.insertAtCursor(elTextarea, customfieldValue)
    }
  }
  insertAtCursor(myField, myValue) {
    this.logger.log('[CREATE-CANNED-RES] - insertAtCursor - myValue ', myValue);

    if (this.addWhiteSpaceBefore === true) {
      myValue = ' ' + myValue;
      this.logger.log('[CREATE-CANNED-RES] - GET TEXT AREA - QUI ENTRO myValue ', myValue);
    }

    //IE support
    if (myField.selection) {
      myField.focus();
      let sel = myField.selection.createRange();
      sel.text = myValue;
      // this.cannedResponseMessage = sel.text;
    }
    //MOZILLA and others
    else if (myField.selectionStart || myField.selectionStart == '0') {
      var startPos = myField.selectionStart;
      this.logger.log('[CREATE-CANNED-RES] - insertAtCursor - startPos ', startPos);

      var endPos = myField.selectionEnd;
      this.logger.log('[CREATE-CANNED-RES] - insertAtCursor - endPos ', endPos);

      myField.value = myField.value.substring(0, startPos) + myValue + myField.value.substring(endPos, myField.value.length);

      // place cursor at end of text in text input element
      myField.focus();
      var val = myField.value; //store the value of the element
      myField.value = ''; //clear the value of the element
      myField.value = val + ' '; //set that value back. 

      // this.cannedResponseMessage = myField.value;

      // this.texareaIsEmpty = false;
      // myField.select();
    } else {
      myField.value += myValue;
      // this.cannedResponseMessage = myField.value;
    }
  }


  async closeModalCreateCannedResponseModal() {
    if (this.menu) {
      this.menu.close('custom')
      this.menu.enable(false, 'custom');
    }
    await this.modalController.getTop()
    this.modalController.dismiss({ confirmed: true })
  }

}
