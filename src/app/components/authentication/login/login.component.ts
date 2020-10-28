import { Injectable, Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';

@Injectable()
@Component({
  selector: 'component-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  @Input() showSpinnerInLoginBtn: boolean;
  @Input() translationMap: Map<string, string>;
  @Input() companyLogoBlackUrl: string;
  @Input() companyName: string;
  @Output() eventSignInWithEmailAndPassword =  new EventEmitter<{email: string, password: string}>();

  // (eventSignInWithEmailAndPassword)="returnSignInWithEmailAndPassword($event)"
  userForm: FormGroup;
  companySiteUrl: string;

  constructor(
    public formBuilder: FormBuilder,
    public toastController: ToastController
  ) { }

  ngOnInit() {
    this.initialize();
  }

  /**
   *
   */
  initialize() {
    const EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
    this.userForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern(EMAIL_REGEXP)]],
      password: ['', Validators.compose([Validators.minLength(6), Validators.required])]
    });
  }

  goToSignupPage() {}
  goToTiledekV1() {}
  goToResetPsw() {}
  emailChanged(email) {}
  passwordChanged(password) {}

  /**
   * signInWithEmailAndPassword
   * @param email
   * @param psw
   */
  signInWithEmailAndPassword() {
    const emailValue = this.userForm.value.email;
    const pswValue = this.userForm.value.password;
    this.showSpinnerInLoginBtn = true;
    this.eventSignInWithEmailAndPassword.emit({email: emailValue, password: pswValue});
  }

  /** */
  showErrorSignIn(error: string) {
    console.log('showErrorSignIn');
    // const error =  this.translationMap.get('LABEL_SIGNIN_ERROR');
    this.showSpinnerInLoginBtn = false;
    this.presentToast(error);

  }

  /** */
  /** */
  async presentToast(error: string) {
    const toast = await this.toastController.create({
      message: error,
      duration: 2000,
      header: 'Attenzione',
      position: 'top',
      buttons: null
    });
    this.toastController.dismiss().then((obj) => {
      console.log('dismesso');
    }).catch(() => {
      console.log('catch');
    }).finally(() => {

      this.showSpinnerInLoginBtn = false;
      console.log('finally', this.showSpinnerInLoginBtn);
    });

    toast.present();

  }






}
