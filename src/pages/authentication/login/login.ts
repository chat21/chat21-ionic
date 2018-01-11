import { Component } from '@angular/core';
import { AlertController, LoadingController, ModalController } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';
// pages
import { RegisterPage } from '../../authentication/register/register';
import { ResetpwdPage } from '../../authentication/resetpwd/resetpwd';
// services
import { AuthService } from '../../../providers/auth-service';
//import { UserService } from '../../../providers/user/user';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})

export class LoginPage {
  private loginForm;
  private submitAttempt: boolean = false;
  private loading: any;
  private showPage: boolean;

  constructor(
    private modalCtrl: ModalController,
    private authService: AuthService, 
    private formBuilder: FormBuilder,
    private alertCtrl: AlertController, 
    private loadingCtrl: LoadingController
    //private userService: UserService
  ) {
    //console.log("LOGIN PAGE");
  }

  /**
   * imposto espressione regolare per verifica email
   * imposto il form della pagina con i campi da validare (email e psw)
   */
  ngOnInit() {
    //console.log('ngOnInit');
    let EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.compose([Validators.required, Validators.pattern(EMAIL_REGEXP)])],
      password: ['', Validators.compose([Validators.minLength(6), Validators.required])]
    });
  }
  /**
   * quando entro nella pagina imposto showPage a true 
   * e visualizzo il div della pagina 
   * controllo se sono già loggato e dismetto la view
   * utile quando vengo dalla registrazione utente
   * show view
   */
  ionViewWillEnter() {
    this.showPage = true;
    // if (this.authService.getUser()){
    //   this.viewCtrl.dismiss({animation:'none'})
    // }
  }
  /**
   * quando esco dalla pagina imposto showPage a false
   * che nasconde il div del login
   */
  ionViewWillLeave(){
    this.showPage = false;
  }
  /**
   * quando scrivo nel campo email o psw
   * richiamo questo metodo che  ???? booohhhh
   * @param input 
   */
  elementChanged(input){
    // let field = input.inputControl.firstname;
    // this[field + "Changed"] = true;
  }
  /**
   * quando premo sul pulsante registrati 
   * richiamo questa func che carica la pagina RegisterPage
   */
  register(){
    let profileModal = this.modalCtrl.create(RegisterPage, null, { enableBackdropDismiss: false });
    profileModal.present({animate: false, duration: 0});
    //this.navCtrl.push(RegisterPage);
  }
  /**
   * quando premo sul pulsante reset psw 
   * richiamo questa func che carica la pagina ResetpwdPage
   */
  resetPwd(){
    let profileModal = this.modalCtrl.create(ResetpwdPage, null, { enableBackdropDismiss: false });
    profileModal.present({animate: false, duration: 0});
    //this.navCtrl.push(ResetpwdPage);
  }
  /**
   * quando premo sul pulsante login richiamo questa func che:
   * effettuo il login e se riesce chiudo tutte le pg aperte
   * altrimenti apro un alert di errore
   */
  loginUserFirebase(){
    this.submitAttempt = true;
    console.log("LOGIN", this.loginForm.value);
    if (!this.loginForm.valid){
      console.log("ERRORE LOGIN:: ",this.loginForm.value);
    } else {
      this.authService.doLoginFirebase(this.loginForm.value.email, this.loginForm.value.password)
      .then( user => {
        //console.log("register",user.uid, this.userService);
        //this.userService.setCurrentUserDetails(user.uid, user.email);
        //dismetto la modale ricarico lista conversazioni passando user
        this.loading.dismiss();
      })
      .catch(error => {
          console.log(error,'ERROR LOGIN FIREBASE');
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
}