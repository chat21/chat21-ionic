import { Component, OnInit } from '@angular/core';

// services
import { AuthService } from '../../../services/auth.service';
import { CustomTranslateService } from '../../../services/custom-translate.service';
import { EventsService } from '../../../services/events-service';

import { LoginComponent } from '../../../components/authentication/login/login.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  showSpinnerInLoginBtn = false;
  companyLogoBlackUrl: string;
  companyName: string;
  public translationMap: Map<string, string>;

  constructor(
    public authService: AuthService,
    private translateService: CustomTranslateService,
    private events: EventsService,
    private loginComponent: LoginComponent
  ) { }

  ngOnInit() {
    this.companyLogoBlackUrl = 'assets/chat21-logo.svg';
    this.companyName = 'Tiledesk'; // this.chatManager.getTenant();
    this.translations();
    this.events.subscribe('sign-in', this.signIn);
  }

  /**
   *
   * @param user
   * @param error
   */
  signIn = (user: any, error: any) => {
    console.log('************** signIn', user);
    console.log('************** error', error);
    if (error) {
      this.showSpinnerInLoginBtn = false;
      console.log('************** showSpinnerInLoginBtn', this.showSpinnerInLoginBtn);
      // faccio uscire alert
      this.loginComponent.test();
    }
  }

  /**
   *
   */
  public translations() {
    const keys = [
      'LABEL_SIGNIN_TO',
      'LABEL_EMAIL',
      'LABEL_PASSWORD',
      'LABEL_SIGNIN',
      'LABEL_DONT_HAVE_AN_ACCOUNT_YET',
      'LABEL_SIGNUP',
      'LABEL_FORGOT_YOUR_PASSWORD',
      'LABEL_CLICK_HERE'
    ];
    this.translationMap = this.translateService.translateLanguage(keys);
  }

  /**
   *
   * @param auth
   */
  returnSignInWithEmailAndPassword(auth: any) {
    console.log('returnSignInWithEmailAndPassword', auth, auth.email, auth.password );
    this.authService.signInWithEmailAndPassword(auth.email, auth.password);
  }


}
