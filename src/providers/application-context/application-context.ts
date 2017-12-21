import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

import { Config } from 'ionic-angular';
// firebase
import * as firebase from 'firebase/app';
// models
import { UserModel } from '../../models/user';

/*
  Generated class for the ApplicationContextProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class ApplicationContext {

  private tenant: string;
  private arrayRef: Array<any> = [];
  private currentUser: firebase.User;
  private currentUserDetails: UserModel;
  private urlNodeFirebase: string;

  constructor(
    public config: Config
  ) {
    this.setTenant();
    this.urlNodeFirebase = '/apps/'+this.tenant+'/';
  }

  setTenant(){
    let appConfig = this.config.get("appConfig");
    this.tenant = appConfig.tenant;
  }
  getTenant(): string {
    return this.tenant;
  }

  setRef(ref, name) {
    this.arrayRef[name] = ref;
  }

  getRef(name): any {
    return this.arrayRef[name];
  }

  setCurrentUser(user) {
    this.currentUser = user;
    //console.log("setCurrentUser *****", this.currentUser);
  }
  getCurrentUser(): firebase.User {
    //return firebase.auth().currentUser;
    return this.currentUser;
  }

  setCurrentUserDetail(currentUserDetails) {
    this.currentUserDetails = currentUserDetails;
  }

  setOffAllReferences(){
    this.arrayRef.forEach(function(data) {
      let item = data.val();
      item.ref.off();
    });
  }

}
