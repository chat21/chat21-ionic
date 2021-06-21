
import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';

// services
import { MessagingAuthService } from 'src/chat21-core/providers/abstract/messagingAuth.service';
import { TiledeskAuthService } from './../../../../chat21-core/providers/tiledesk/tiledesk-auth.service';
import { CustomTranslateService } from 'src/chat21-core/providers/custom-translate.service';
import { EventsService } from '../../../services/events-service';

import { LoginComponent } from '../../../components/authentication/login/login.component';

// utils
import { isInArray } from 'src/chat21-core/utils/utils';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})

export class LoginPage implements OnInit {
  showSpinnerInLoginBtn = false;
  showErrorSignIn = false;
  companyLogoBlackUrl: string;
  companyName: string;

  public translationMap: Map<string, string>;
  private subscriptions = [];


  constructor(
    public tiledeskAuthService: TiledeskAuthService,
    public messagingAuthService: MessagingAuthService,
    private translateService: CustomTranslateService,
    private events: EventsService,
    private loginComponent: LoginComponent,
    public toastController: ToastController
  ) { }

  ngOnInit() {
    this.initialize();
  }


  /** */
  ionViewDidEnter() {
  }

  /** */
  ionViewWillLeave() {
    this.unsubescribeAll();
  }

  /** */
  initialize() {
    this.companyLogoBlackUrl = 'assets/chat21-logo.svg';
    this.companyName = 'Tiledesk'; // this.chatManager.getTenant();
    this.translations();
    this.events.subscribe('sign-in', this.signIn);
    this.setSubscriptions();
  }

  /** */
  private setSubscriptions() {
    const keySubscription = 'sign-in';
    if (!isInArray(keySubscription, this.subscriptions)) {
      this.subscriptions.push(keySubscription);
      this.events.subscribe(keySubscription, this.signIn);
    }
  }

  /**
   *
   * @param user
   * @param error
   */
  signIn = (user: any, error: any) => {
    console.log('LOGIN PAGE signIn - user', user);
    console.log('LOGIN PAGE signIn - error', error);
    if (error) {
      // faccio uscire alert
      const errore = this.translationMap.get('LABEL_SIGNIN_ERROR');
      this.showSpinnerInLoginBtn = false;
      // this.presentToast(errore);
      this.loginComponent.showErrorSignIn(errore);
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
      'LABEL_CLICK_HERE',
      'LABEL_SIGNIN_ERROR',
      'SIGNIN_ERROR_USER_NOT_FOUND',
      'SIGNIN_ERROR_USER_WRONG_PSW',
      'Email is required',
      'Email must be a valid email',
      'Password is required',
      'Password must be at least 6 characters long'

    ];
    this.translationMap = this.translateService.translateLanguage(keys);
  }



  /**
   *
   * @param auth
   */
  returnSignInWithEmailAndPassword(auth: any) {
    this.showSpinnerInLoginBtn = true
    console.log('LOGIN PAGE returnSignInWithEmailAndPassword', auth, auth.email, auth.password);
    this.tiledeskAuthService.signInWithEmailAndPassword(auth.email, auth.password)
      .then(tiledeskToken => {
        this.messagingAuthService.createCustomToken(tiledeskToken)
      })
      .catch(error => {
        this.showSpinnerInLoginBtn = false;
        console.log('LOGIN PAGE signInWithEmailAndPassword error', error);
        console.log('LOGIN PAGE signInWithEmailAndPassword error msg', error.error.msg);
        console.log('LOGIN PAGE signInWithEmailAndPassword error msg TYPE OF', typeof error.error.msg);
        let error_msg = '';
        if (error.error.msg == "Authentication failed. User not found.") {
          console.log('LOGIN PAGE signInWithEmailAndPassword error HERE 1', error.error.msg);
          error_msg = this.translationMap.get('SIGNIN_ERROR_USER_NOT_FOUND');
        } else if (error.error.msg === "Authentication failed. Wrong password.") {
          console.log('LOGIN PAGE signInWithEmailAndPassword error HERE 2', error.error.msg);
          error_msg = this.translationMap.get('SIGNIN_ERROR_USER_WRONG_PSW');
        } else {
          console.log('LOGIN PAGE signInWithEmailAndPassword error HERE 3', error.error.msg);
          error_msg = this.translationMap.get('LABEL_SIGNIN_ERROR');
        }

        this.presentToast(error_msg)
      })
      .finally(() => {
        this.showSpinnerInLoginBtn = false;
        console.log('LOGIN PAGE signInWithEmailAndPassword ');
      });

    // this.authService.signInWithEmailAndPassword(auth.email, auth.password);
  }

  async presentToast(errormsg: string) {
    const toast = await this.toastController.create({
      message: errormsg,
      duration: 3000,
      color: "danger",
      cssClass: 'login-toast-custom-class',
    });
    toast.present();
  }

  /** */
  // async presentToast(error: string) {
  //   const toast = await this.toastController.create({
  //     message: error,
  //     duration: 2000,
  //     header: 'Attenzione',
  //     position: 'top',
  //     buttons: null
  //   });
  //   toast.present();
  // }

  /** */
  private unsubescribeAll() {
    console.log('unsubescribeAll: ', this.subscriptions);
    this.subscriptions.forEach((subscription: any) => {
      console.log('unsubescribe: ', subscription);
      this.events.unsubscribe(subscription, null);
    });
    this.subscriptions = [];
  }


}
