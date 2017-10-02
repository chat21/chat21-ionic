import { Component } from '@angular/core';
import { ViewController, NavController, AlertController, NavParams, LoadingController } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';

import { AuthService } from '../../../providers/auth-service';
//import { ListaConversazioniPage } from '../../lista-conversazioni/lista-conversazioni';
import { RegisterPage } from '../../authentication/register/register';
import { ResetpwdPage } from '../../authentication/resetpwd/resetpwd';
// services
import { UserService } from '../../../providers/user/user';


/*
  Generated class for the Login page.
  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {

  public loginForm;
  emailChanged: boolean = false;
  usernameChanged: boolean = false;
  passwordChanged: boolean = false;
  submitAttempt: boolean = false;
  loading: any;
  
  constructor(
    public viewCtrl: ViewController, 
    public navCtrl: NavController, 
    public authService: AuthService, 
    public navParams: NavParams, 
    public formBuilder: FormBuilder,
    public alertCtrl: AlertController, 
    public loadingCtrl: LoadingController,
    private userService: UserService
  ) {
   
    console.log("LOGIN PAGE");
    let EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
    this.loginForm = formBuilder.group({
      email: ['', Validators.compose([Validators.required, Validators.pattern(EMAIL_REGEXP)])],
      //username: ['', Validators.compose([Validators.minLength(6), Validators.required])],
      password: ['', Validators.compose([Validators.minLength(6), Validators.required])]
    });
  }

  ionViewDidLoad() {
    //console.log('LoginPage ionViewDidLoad **************');
  }
  ionViewWillEnter() {
    console.log('LoginPage ionViewWillEnter **************');
    //controllo se sonno già loggato e dismetto la view
    //utile quando vengo dalla registrazione utente
    if (this.authService.getUser()){
      this.viewCtrl.dismiss({animation:'none'})
    }
  }
  ionViewWillLeave(){
     //console.log('LoginPage ionViewWillLeave **************');
  }
  ionViewDidLeave() {
     //console.log('LoginPage ionViewDidLeave **************');
  }

  elementChanged(input){
    console.log('elementChanged **************');
    let field = input.inputControl.name;
    this[field + "Changed"] = true;
  }

  register(){
    this.navCtrl.push(RegisterPage)
    // .then( res => {
    //   this.viewCtrl.dismiss({animation:'none'})
    // });
  }

  resetPwd(){
    this.navCtrl.push(ResetpwdPage);
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
        this.viewCtrl.dismiss();
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