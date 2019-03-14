import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController, ViewController } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';

//provider
import { AuthService } from '../../../providers/auth-service';

@Component({
  selector: 'page-resetpwd',
  templateUrl: 'resetpwd.html'
})
export class ResetpwdPage {
  public resetpwdForm;
  public emailChanged: boolean = false;
  public submitAttempt: boolean = false;
  public loading: any;

  constructor(public navCtrl: NavController, 
    public authService: AuthService, 
    public formBuilder: FormBuilder, 
    public alertCtrl: AlertController, 
    public loadingCtrl: LoadingController,
    public viewCtrl: ViewController
  ) {
  }
  /**
   * imposto espressione regolare per verifica email
   * imposto il form della pagina con i campi da validare (email)
   */
  ngOnInit() {
    console.log("ResetpwdPage PAGE");
    let EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
    this.resetpwdForm = this.formBuilder.group({
      email: ['', Validators.compose([Validators.required, Validators.pattern(EMAIL_REGEXP)])]
    });
  }

  /**
   * chiamato ogni volta che cambio il valore di un campo input
   * NON ricordo a cosa serve!!!!
   * @param input 
   */
  elementChanged(input){
    if(input && input.inputControl){
      let field = input.inputControl.firstname;
      this[field + "Changed"] = true;
    }
    return
  }
  /**
   * metodo chiamato dalla pagina html alla pressione del tasto 'recupera password'
   * verifico se i campi inseriti sono corretti e procedo al recupero psw
   * al termine dismetto loading e dismetto view
   */
  resetPwd() {
    if (!this.resetpwdForm.valid){
      console.log(this.resetpwdForm.value);
    } else {
      this.authService.resetPassword(this.resetpwdForm.value.email)
      .then( authService => {
        //this.navCtrl.setRoot(ListaConversazioniPage);
        this.loading.dismiss().then( () => {
          //dismetto la modale ricarico lista conversazioni passando user
          //this.loading.dismiss();
          this.viewCtrl.dismiss({animate: false, duration: 0});
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
  /**
   * chiudo il popup di recupero password
   */
  goBack(){
    this.navCtrl.pop({animate: false, duration: 0});    
  }
}