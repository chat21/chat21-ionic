import { Component } from '@angular/core';
import { ViewController, NavController, AlertController, LoadingController } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';

// services
import { AuthService } from '../../../providers/auth-service';
import { UserService } from '../../../providers/user/user';

@Component({
  selector: 'page-register',
  templateUrl: 'register.html'
})
export class RegisterPage {

  public registerForm;
  public usernameChanged: boolean = false;
  public emailChanged: boolean = false;
  public passwordChanged: boolean = false;
  public fullnameChanged: boolean = false;
  public submitAttempt: boolean = false;
  public loading: any;

  constructor(
    public viewCtrl: ViewController, 
    public navCtrl: NavController, 
    public authService: AuthService,  
    public formBuilder: FormBuilder,
    public alertCtrl: AlertController, 
    public loadingCtrl: LoadingController,
    public userService: UserService
  ) {
  }

  /**
   * imposto espressione regolare per verifica email
   * imposto il form della pagina con i campi da validare (email, psw, firstname, lastname)
   */
  ngOnInit() {
    let EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
    this.registerForm = this.formBuilder.group({
      email: ['', Validators.compose([Validators.required, Validators.pattern(EMAIL_REGEXP)])],
      password: ['', Validators.compose([Validators.minLength(6), Validators.required])],
      firstname: ['', Validators.compose([Validators.minLength(2), Validators.required])],
      lastname: ['', Validators.compose([Validators.minLength(2), Validators.required])]
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
   * metodo chiamato dalla pagina html alla pressione del tasto 'registrati'
   * verifico se i campi inseriti sono corretti e procedo alla registrazione dell'utente
   * al termine dismetto loading e dismetto view
   */
  createAccount(){
    this.submitAttempt = true;
    if (!this.registerForm.valid){
      console.log(this.registerForm.value);
      // non faccio nulla perchè gli errori sono evidenziati in rosso nella pg html
    } else {
      console.log("createAccount", this.authService);
      this.authService.register(this.registerForm.value.email, this.registerForm.value.password, this.registerForm.value.firstname, this.registerForm.value.lastname)
      .then((newUser) => {
        // creo current user detail
        console.log("register::: ",newUser.user, this.userService);
        this.userService.saveCurrentUserDetail(newUser.user.uid, this.registerForm.value.email, this.registerForm.value.firstname, this.registerForm.value.lastname)
        .then(_ => {
          console.log('success saveCurrentUserDetail');
          this.viewCtrl.dismiss({animate: false, duration: 0});
          this.loading.dismiss();
          // this.loading.dismiss().then( () => {
          //   //dismetto la modale ricarico lista conversazioni passando user
          //   //this.loading.dismiss();
          //   console.log('success!!!!');
          //   this.viewCtrl.dismiss({animate: false, duration: 0});
          // });
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
  /**
   * chiudo il popup di registrazione
   */
  goBack(){
    this.navCtrl.pop({animate: false, duration: 0});    
  }

}