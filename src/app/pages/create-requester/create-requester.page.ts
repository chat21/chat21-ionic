import { Component, Input, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormControl} from '@angular/forms';
import { ModalController } from '@ionic/angular'
import { TranslateService } from '@ngx-translate/core';
import { TiledeskService } from 'src/app/services/tiledesk/tiledesk.service';
import { TiledeskAuthService } from 'src/chat21-core/providers/tiledesk/tiledesk-auth.service';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
@Component({
  selector: 'app-create-requester',
  templateUrl: './create-requester.page.html',
  styleUrls: ['./create-requester.page.scss'],
})
export class CreateRequesterPage implements OnInit {
  public new_user_name: string;
  public new_user_email : string;

  validations_form: FormGroup;
  @Input() projectUserAndLeadsArray: any
 
  prjctID: string;
  tiledeskToken: string;
  showSpinnerCreateRequester: boolean = false; 
  requester_id: string;
  logger: LoggerService = LoggerInstance.getInstance();
  constructor(
    public modalController: ModalController,
    private formBuilder: FormBuilder,
    public tiledeskService: TiledeskService,
    public tiledeskAuthService: TiledeskAuthService,
    private translate: TranslateService,
  ) {   }

  ngOnInit() {
    this.logger.log('[CREATE-REQUESTER] projectUserAndLeadsArray ', this.projectUserAndLeadsArray)
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

      name: new FormControl('', Validators.required),
     
      email: new FormControl('', Validators.compose([
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
     
    });
  }

  validation_messages = {
    'name': [
      { type: 'required', message: this.translate.instant('NameIsRequired') }
    ],
   
    'email': [
      { type: 'pattern', message: this.translate.instant('EnterValidEmail') }
    ],
  };

  onSubmit(values){
    this.logger.log('[CREATE-REQUESTER] ON SUBMIT VALUSES' , values);
    this.new_user_name = values.name
    this.new_user_email = values.email
    this.createProjectUserAndThenNewLead(this.new_user_name,  this.new_user_email)
  }

  createProjectUserAndThenNewLead(new_user_name, new_user_email) {
    this.showSpinnerCreateRequester = true; 
    this.logger.log('[CREATE-REQUESTER] - CREATE-NEW-USER name ', new_user_name);
    this.logger.log('[CREATE-REQUESTER] - CREATE-NEW-USER email ', new_user_email);


    this.tiledeskService.createNewProjectUserToGetNewLeadID(this.prjctID, this.tiledeskToken).subscribe(res => {
      this.logger.log('[CREATE-REQUESTER] - CREATE-NEW-USER - CREATE-PROJECT-USER ', res);
      this.logger.log('[CREATE-REQUESTER] - CREATE-NEW-USER - CREATE-PROJECT-USER UUID ', res.uuid_user);
      if (res) {
        if (res.uuid_user) {
          let new_lead_id = res.uuid_user
          this.createNewContact(new_lead_id, new_user_name, new_user_email, this.prjctID, this.tiledeskToken)
        }
      }
    }, error => {
      this.showSpinnerCreateRequester = false; 
      this.logger.error('[CREATE-REQUESTER] - CREATE-NEW-USER - CREATE-PROJECT-USER - ERROR: ', error);
    }, () => {

      this.logger.log('[CREATE-REQUESTER] - CREATE-NEW-USER - CREATE-PROJECT-USER - COMPLETE');
    });
  }


  createNewContact(lead_id: string, lead_name: string, lead_email: string, projecId: string, tiledeskToken: string) {
    this.tiledeskService.createNewLead(lead_id, lead_name, lead_email, projecId, tiledeskToken ).subscribe(lead => {
      this.logger.log('[CREATE-REQUESTER] - CREATE-NEW-USER - CREATE-NEW-LEAD -  RES ', lead);
      this.projectUserAndLeadsArray.push({ id: lead.lead_id, name: lead.fullname, role: 'lead', email: lead_email, requestertype: 'lead', requester_id: lead._id});
      this.requester_id = lead._id
      // this.projectUserAndLeadsArray.push({ id: lead.lead_id, name: lead.fullname + ' (lead)' });
      // this.projectUserAndLeadsArray = this.projectUserAndLeadsArray.slice(0);
      this.logger.log('[CREATE-REQUESTER]- CREATE-NEW-USER - projectUserAndLeadsArray AFTERT NEW LEAD CREATION  : ', this.projectUserAndLeadsArray);
    }, error => {
      this.showSpinnerCreateRequester = false; 
      this.logger.error('[CREATE-REQUESTER]- CREATE-NEW-USER - CREATE-NEW-LEAD - ERROR: ', error);
    }, () => {
      
      this.closeModalAddNewRequester( this.projectUserAndLeadsArray, lead_id, this.requester_id)
      // -------------------------------------------------
      // When is cmpleted the creation of the new reqester
      // -------------------------------------------------
      // this.displayCreateNewUserModal = 'none'
      // this.displayInternalRequestModal = 'block'

      // Auto select the new lead crerated in the select Requester
      // this.selectedRequester = lead_id
      this.logger.log('[WS-REQUESTS-LIST] - CREATE-NEW-USER - CREATE-NEW-LEAD * COMPLETE *');
    });
  }

  async closeModalAddNewRequester( projectUserAndLeadsArray, lead_id, requester_id) {
    this.logger.log('[CREATE-REQUESTER]', this.modalController)
    this.logger.log( '[CREATE-REQUESTER] .getTop()',this.modalController.getTop())
    await this.modalController.getTop()
    this.modalController.dismiss({updatedProjectUserAndLeadsArray: projectUserAndLeadsArray, selectedRequester: lead_id, requester_type: 'lead', requester_id: requester_id })
  }

}
