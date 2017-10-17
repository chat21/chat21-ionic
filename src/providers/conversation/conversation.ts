import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { Config } from 'ionic-angular';
import * as firebase from 'firebase/app';
import { ConversationModel } from '../../models/conversation';

/*
  Generated class for the ConversationProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class ConversationProvider {
  private tenant: string;
  private items;//: AngularFireList<any>;

  constructor(
    public http: Http,
    public config: Config,
    //public db: AngularFireDatabase
  ) {
    console.log('Hello ConversationProvider Provider');
    // recupero tenant
    const appConfig = config.get("appConfig");
    this.tenant = appConfig.tenant;

  }

  loadListConversations(): any {
    //recupero uid current user
    const currentUser = firebase.auth().currentUser;
    const urlNodeFirebase = '/apps/'+this.tenant+'/users/'+currentUser.uid+'/conversations';
    //console.log("urlNodeFirebase::", urlNodeFirebase);
    let ref = firebase.database().ref(urlNodeFirebase).orderByChild('timestamp').limitToLast(50);
    //console.log("loadListConversations::", ref);
    return ref;
  }

}
