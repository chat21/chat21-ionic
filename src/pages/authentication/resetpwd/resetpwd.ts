import { Component } from '@angular/core';
import { NavController, AlertController, NavParams, LoadingController, ViewController } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../providers/auth-service';
import { ListaConversazioniPage } from '../../lista-conversazioni/lista-conversazioni'

/*
  Generated class for the Resetpwd page.
  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/

@Component({
  selector: 'page-resetpwd',
  templateUrl: 'resetpwd.html'
})
export class ResetpwdPage {
  public resetpwdForm;
  emailChanged: boolean = false;
  submitAttempt: boolean = false;
  loading: any;

  constructor(public navCtrl: NavController, 
    public authService: AuthService, 
    public navParams: NavParams, 
    public formBuilder: FormBuilder, 
    public alertCtrl: AlertController, 
    public loadingCtrl: LoadingController,
    public viewCtrl: ViewController) {
    console.log("ResetpwdPage PAGE");
    let EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
    this.resetpwdForm = formBuilder.group({
      email: ['', Validators.compose([Validators.required, Validators.pattern(EMAIL_REGEXP)])]
    });
  }
  ionViewDidLoad() {
    console.log('ResetpwdPage ionViewDidLoad **************');
  }

  elementChanged(input){
    let field = input.inputControl.name;
    this[field + "Changed"] = true;
  }

  resetPwd() {
    if (!this.resetpwdForm.valid){
      console.log(this.resetpwdForm.value);
    } else {
      this.authService.resetPassword(this.resetpwdForm.value.email)
      .then( authService => {
        //this.navCtrl.setRoot(ListaConversazioniPage);
        this.loading.dismiss().then( () => {
          //dismetto la modale ricarico lista conversazioni passando user
          this.loading.dismiss();
          this.viewCtrl.dismiss();
        });
      }, error => {
        this.loading.dismiss().then( () => {
          let alert = this.alertCtrl.create({
            message: error.message,
            buttons: [
              {
                text: "Ok",
                role: 'cancel'
              }
            ]
          });
          alert.present();
        });
      });
      this.loading = this.loadingCtrl.create({
        dismissOnPageChange: true,
      });
      this.loading.present();
    }
  }

  goBack(){
    this.navCtrl.pop();    
  }
}