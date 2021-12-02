import { Injectable, Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController, IonInput } from '@ionic/angular';
import { AppConfigProvider } from '../../../services/app-config';


// Logger
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';

type UserFields = 'email' | 'password';
type FormErrors = { [u in UserFields]: string };

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
  @Output() eventSignInWithEmailAndPassword = new EventEmitter<{ email: string, password: string }>();

  // (eventSignInWithEmailAndPassword)="returnSignInWithEmailAndPassword($event)"

  // @ViewChild('email', {  static: false })  emailInputEl: IonInput;
  userForm: FormGroup;
  companySiteUrl: string;
  emailMustBeAValidEmail: string;
  DASHBOARD_URL: string;

  formErrors: FormErrors = {
    'email': '',
    'password': '',
  };
  validationMessages = {
    'email': {
      'required': 'Email is required',
      'pattern': 'Email must be a valid email',
    },
    'password': {
      'required': 'Password is required',
    },
  };
  // 'minlength': 'Password must be at least 6 characters long',
  private logger: LoggerService = LoggerInstance.getInstance();

  constructor(
    public formBuilder: FormBuilder,
    public toastController: ToastController,
    public appConfig: AppConfigProvider
  ) { }

  ngOnInit() {
    this.buildForm();
    this.DASHBOARD_URL = this.appConfig.getConfig().dashboardUrl;
    this.logger.log('LOGIN-COMP OnInit DASHBOARD_URL', this.DASHBOARD_URL)
    // this.showSpinnerInLoginBtn = false;
  }
  // ngAfterViewChecked() {
  //   this.emailInputEl.setFocus()
  // }

  buildForm() {
    const EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
    this.userForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern(EMAIL_REGEXP)]],
      password: ['', Validators.compose([Validators.required])]
    });

    // Validators.minLength(6),
    this.userForm.valueChanges.subscribe((data) => this.onValueChanged(data));
    this.onValueChanged(); // reset validation messages

  }

  // Updates validation state on form changes.
  onValueChanged(data?: any) {
    if (!this.userForm) { return; }
    const form = this.userForm;
    for (const field in this.formErrors) {
      // tslint:disable-next-line:max-line-length
      if (Object.prototype.hasOwnProperty.call(this.formErrors, field) && (field === 'email' || field === 'password')) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          // this.logger.log('buildForm onValueChanged messages',messages)
          if (control.errors) {
            for (const key in control.errors) {
              if (Object.prototype.hasOwnProperty.call(control.errors, key)) {
                this.formErrors[field] += this.translationMap.get(`${(messages as { [key: string]: string })[key]}`);
                // this.logger.log('buildForm onValueChanged   this.formErrors[field] ',  this.formErrors[field])

              }
            }
          }
        }
      }
    }
  }


  goToTiledekV1() { }


  goToResetPsw() {
    const url = this.DASHBOARD_URL + '#/forgotpsw';
    window.open(url);
  }

  goToSignupPage() {
    const url = this.DASHBOARD_URL + '#/signup';
    window.open(url, "_self");
  }


  /**
   * signInWithEmailAndPassword
   * @param email
   * @param psw
   */
  signInWithEmailAndPassword() {
    const emailValue = this.userForm.value.email;
    const pswValue = this.userForm.value.password;
    this.showSpinnerInLoginBtn = true;
    this.eventSignInWithEmailAndPassword.emit({ email: emailValue, password: pswValue });
  }

  /** */
  showErrorSignIn(error: string) {
    this.logger.error('showErrorSignIn TOAST');
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
      this.logger.log('dismesso');
    }).catch(() => {
      this.logger.log('catch');
    }).finally(() => {

      this.showSpinnerInLoginBtn = false;
      this.logger.log('finally', this.showSpinnerInLoginBtn);
    });

    toast.present();

  }






}
