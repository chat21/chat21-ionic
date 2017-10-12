import { Component } from '@angular/core';
import { ViewController, NavController, AlertController, NavParams, LoadingController } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../providers/auth-service';

// services
import { UserService } from '../../../providers/user/user';
//import { ListPage } from '../list/list';
//import {ListaConversazioniPage} from '../../lista-conversazioni/lista-conversazioni'

@Component({
  selector: 'page-register',
  templateUrl: 'register.html'
})
export class RegisterPage {

  public registerForm;
  usernameChanged: boolean = false;
  emailChanged: boolean = false;
  passwordChanged: boolean = false;
  fullnameChanged: boolean = false;
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
    let EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
    this.registerForm = formBuilder.group({
      //username: ['', Validators.compose([Validators.minLength(2), Validators.required])],
      email: ['', Validators.compose([Validators.required, Validators.pattern(EMAIL_REGEXP)])],
      password: ['', Validators.compose([Validators.minLength(6), Validators.required])],
      name: ['', Validators.compose([Validators.minLength(2), Validators.required])],
      surname: ['', Validators.compose([Validators.minLength(2), Validators.required])]
    });
  }

  elementChanged(input){
    let field = input.inputControl.name;
    this[field + "Changed"] = true;
  }

  
  createAccount(){
    this.submitAttempt = true;
    if (!this.registerForm.valid){
      console.log(this.registerForm.value);
    } else {
      console.log("createAccount", this.authService);
      this.authService.register(this.registerForm.value.username, this.registerForm.value.email, this.registerForm.value.password, this.registerForm.value.name, this.registerForm.value.surname)
      .then((newUser) => {
        // creo current user detail
        console.log("register",newUser.uid, this.userService);
        this.userService.saveCurrentUserDetail(newUser.uid, this.registerForm.value.username, this.registerForm.value.name, this.registerForm.value.surname)
        .then(_ => {
          console.log('success saveCurrentUserDetail');
          this.loading.dismiss().then( () => {
            //dismetto la modale ricarico lista conversazioni passando user
            this.loading.dismiss();
            this.viewCtrl.dismiss();
          });
        }) 
        .catch(err => {
          console.log(err,'ERROR saveCurrentUserDetail');
          this.authService.delete();
        });
      })
      .catch(error => {
        console.log(error, 'Registrazione authentication fallita');
        this.loading.dismiss().then( () => {
          console.log("dismetto con errore");
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
      
      // attivo il loading
      this.loading = this.loadingCtrl.create({
        dismissOnPageChange: true,
      });
      this.loading.present();
    }
  }

  goBack(){
    this.navCtrl.pop({animate: false, duration: 0});    
  }

}