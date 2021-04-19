import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';

// services
import { AuthService } from 'src/chat21-core/providers/abstract/auth.service';
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
    public authService: AuthService,
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
    const subAuthStateChanged = this.authService.BSAuthStateChanged.subscribe(state => {
      console.log('BSAuthStateChanged:::', state);
    });
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
      const errore =  this.translationMap.get('LABEL_SIGNIN_ERROR');
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
      'LABEL_SIGNIN_ERROR'
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
