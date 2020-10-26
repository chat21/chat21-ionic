import { Injectable, Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
  company_site_url: string;

  constructor(
    public formBuilder: FormBuilder
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

  test() {
    console.log('okkkkkk');
    this.showSpinnerInLoginBtn = false;

  }

}
