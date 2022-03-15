import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { TiledeskAuthService } from 'src/chat21-core/providers/tiledesk/tiledesk-auth.service';
import { TiledeskService } from 'src/app/services/tiledesk/tiledesk.service';

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
  logger: LoggerService = LoggerInstance.getInstance();

  prjctID: string;
  tiledeskToken: string;
  showSpinnerCreateCannedResponse: boolean = false;
  constructor(
    public modalController: ModalController,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    public tiledeskAuthService: TiledeskAuthService,
    public tiledeskService: TiledeskService
  ) { }

  ngOnInit() {
    console.log('CREATE-CANNED-RESPONSES - message ', this.message)

    const stored_project = localStorage.getItem('last_project')
    const storedPrjctObjct = JSON.parse(stored_project)
    this.logger.log('[CREATE-REQUESTER] storedPrjctObjct ', storedPrjctObjct)
    if (storedPrjctObjct) {
      this.prjctID = storedPrjctObjct.id_project.id
      this.logger.log('[CREATE-REQUESTER] this.prjctID ', this.prjctID)
    }
    this.tiledeskToken = this.tiledeskAuthService.getTiledeskToken()
    this.logger.log('[CREATE-REQUESTER] tiledeskToken ', this.tiledeskToken)


    this.buildForm()
  }
  buildForm() {
    this.validations_form = this.formBuilder.group({

      title: new FormControl('', Validators.required),

      message: new FormControl('', Validators.required),

    });

    this.setValues()
  }

  setValues() {

    // console.log('[CREATE-CANNED-RESPONSE] - validations_form > controls  ', this.validations_form.controls)
    if (this.message && this.message.text) {
      let cannedTitle = ''
      const titleMaxCharacters = 37
      if (this.message.text.length > titleMaxCharacters) {
        cannedTitle = this.message.text.substring(0, titleMaxCharacters) + '...'
      } else {
        cannedTitle = this.message.text
      }
      console.log('[CREATE-CANNED-RESPONSE] - cannedTitle  ', cannedTitle.trim())
      console.log('[CREATE-CANNED-RESPONSE] - cannedMsg  ', this.message.text.trim())
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
    console.log('[CREATE-CANNED-RESPONSE] ON SUBMIT VALUES', values);
    this.canned_response_title = values.title
    this.canned_response_message = values.message
    console.log('[CREATE-CANNED-RESPONSE] ON SUBMIT canned_response_title', this.canned_response_title);
    console.log('[CREATE-CANNED-RESPONSE] ON SUBMIT canned_response_title', this.canned_response_message);
    this.createResponse(this.canned_response_message, this.canned_response_title)
  }

  createResponse(canned_response_message, canned_response_title) {
    this.showSpinnerCreateCannedResponse= true;
    console.log('[CANNED-RES-EDIT-CREATE] - CREATE CANNED RESP - MSG ', canned_response_message);
    console.log('[CANNED-RES-EDIT-CREATE] - CREATE CANNED RESP - TITLE ', canned_response_title);

    // if (this.cannedResponseMessage && this.cannedResponseMessage.length > 0) {
    //   this.texareaIsEmpty = false;

    // let responseTitle = 'Untitled'
    // if (this.cannedResponseTitle) {
    //   responseTitle = this.cannedResponseTitle
    // }

    this.tiledeskService.createCannedResponse(canned_response_message.trim(), canned_response_title.trim(), this.prjctID, this.tiledeskToken)
      .subscribe((responses: any) => {
        console.log('[CREATE-CANNED-RESPONSE] - CREATE CANNED RESP - RES ', responses);

      }, (error) => {
        console.error('[CREATE-CANNED-RESPONSE]- CREATE CANNED RESP - ERROR  ', error);
        this.showSpinnerCreateCannedResponse= false;
      }, () => {
        console.log('[CREATE-CANNED-RESPONSE] - CREATE CANNED RESP * COMPLETE *');
        this.showSpinnerCreateCannedResponse= false;
        this.closeModalCreateCannedResponseModal()
      });
  }
  //  else {
  //   this.texareaIsEmpty = true;
  //   this.elTextarea.focus()

  // }



  async closeModalCreateCannedResponseModal() {

    await this.modalController.getTop()
    this.modalController.dismiss({ confirmed: true })
  }

}
