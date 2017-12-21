import { Component } from '@angular/core';
import { Config, ViewController, NavController, AlertController, NavParams, LoadingController, ModalController } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';

// pages
import { RegisterPage } from '../../authentication/register/register';
import { ResetpwdPage } from '../../authentication/resetpwd/resetpwd';

// services
import { AuthService } from '../../../providers/auth-service';
import { UserService } from '../../../providers/user/user';
import { ApplicationContext } from '../../../providers/application-context/application-context';


@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})

export class LoginPage {
  private loginForm;
  // private emailChanged: boolean = false;
  // private usernameChanged: boolean = false;
  // private passwordChanged: boolean = false;
  private submitAttempt: boolean = false;
  private loading: any;
  private tenant: string;
  private showPage: boolean;

  constructor(
    private viewCtrl: ViewController, 
    private navCtrl: NavController, 
    private modalCtrl: ModalController,
    private authService: AuthService, 
    private navParams: NavParams, 
    private formBuilder: FormBuilder,
    private alertCtrl: AlertController, 
    private loadingCtrl: LoadingController,
    private userService: UserService,
    private config: Config,
    private applicationContext: ApplicationContext
  ) {
    console.log("LOGIN PAGE");
    this.tenant = this.applicationContext.getTenant();
    let EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
    this.loginForm = formBuilder.group({
      email: ['', Validators.compose([Validators.required, Validators.pattern(EMAIL_REGEXP)])],
      password: ['', Validators.compose([Validators.minLength(6), Validators.required])]
    });
  }

  ionViewDidLoad() {
  }

  ionViewWillEnter() {
    console.log('************** LoginPage ionViewWillEnter **************');
    this.showPage = true;
    //controllo se sonno già loggato e dismetto la view
    //utile quando vengo dalla registrazione utente
    // show view

    // if (this.authService.getUser()){
    //   this.viewCtrl.dismiss({animation:'none'})
    // }
  }

  ionViewWillLeave(){
    console.log('************** LoginPage ionViewWillLeave **************');
    // hide view
    this.showPage = false;
  }

  elementChanged(input){
    console.log('************** elementChanged **************');
    let field = input.inputControl.firstname;
    this[field + "Changed"] = true;
  }

  register(){
    let profileModal = this.modalCtrl.create(RegisterPage, null, { enableBackdropDismiss: false });
    profileModal.present({animate: false, duration: 0});
    //this.navCtrl.push(RegisterPage);
  }

  resetPwd(){
    let profileModal = this.modalCtrl.create(ResetpwdPage, null, { enableBackdropDismiss: false });
    profileModal.present({animate: false, duration: 0});
    //this.navCtrl.push(ResetpwdPage);
  }

  loginUserFirebase(){
    this.submitAttempt = true;
    console.log("LOGIN", this.loginForm.value);
    if (!this.loginForm.valid){
      console.log("ERRORE LOGIN:: ",this.loginForm.value);
    } else {
      this.authService.doLoginFirebase(this.loginForm.value.email, this.loginForm.value.password)
      .then( user => {
        console.log("register",user.uid, this.userService);
        this.userService.setCurrentUserDetails(user.uid, user.email);
        //dismetto la modale ricarico lista conversazioni passando user
        this.loading.dismiss();
        //this.viewCtrl.dismiss();
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