import { Injectable } from '@angular/core';
import { Config } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import 'rxjs/add/operator/map';

import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';


// singlenton
import { UserService } from '../providers/user/user';

/*
  Generated class for the AuthService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class AuthService {

  tenant: string;
  public token: any;
  public fireAuth: firebase.auth.Auth;
  public userProfile: firebase.database.Reference;
  public urlNodeFirebase: string;

  constructor(
    private afAuth: AngularFireAuth, 
    private config: Config, 
    private storage: Storage,
    private userService:UserService
  ) {
    console.log('Hello AuthService Provider');
    // recupero tenant
    // console.log('ionViewDidLoad First');
    // this.userProvider.log(); // log First singleton data
    // this.userProvider.set("First singleton data")

    let appConfig = config.get("appConfig");
    this.tenant = appConfig.tenant;

    this.fireAuth = firebase.auth();
    this.urlNodeFirebase = '/apps/'+this.tenant+'/contacts/';
    this.userProfile = firebase.database().ref(this.urlNodeFirebase);
    //this.afAuth.authState.subscribe();

    // this.afAuth.authState.subscribe((user: firebase.User) => {
    //   this.currentUser = user;
    // });
  }
  
  //Start Firebase Auth//

  // GetUser
  getUser(): firebase.User {
    return this.fireAuth.currentUser;
  }
 

  // Create User Anonymous
  // createAnonymousUser(): firebase.Promise<any> {
  //   return this.fireAuth.signInAnonymously();
  // }

  // Login with Email
  doLoginFirebase(email: string, password: string): any {
    return this.fireAuth.signInWithEmailAndPassword(email, password)
    // .then(res => {
    //   console.log("signInWithEmailAndPassword::: ",res);
    // });
  }


  // Signin with Facebook
  // signInWithFacebook(): any {
  //   return this.afAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider())
  //   .then(res => console.log(res));
  // }


  // Register User with Email
  register(username: string, email: string, password: string, name: string, surname: string): any {
    return this.fireAuth.createUserWithEmailAndPassword(email, password); 
  }

  // delete account
  delete(){
    var user = firebase.auth().currentUser;
    user.delete().then(function() {
      // User deleted.
      console.log("delete OK ");
    }).catch(function(error) {
      // An error happened.
      console.log("delete with error: ",error);
    });
  }

  // Reset Password
  resetPassword(email: string): any {
    return this.fireAuth.sendPasswordResetEmail(email);
  }
  
  logoutUser(): firebase.Promise<any> {
    return firebase.auth().signOut()
    // .then((res) => {
    //   console.log("logout1",res);
    //   console.log("logout2", this.getUser());
    // })
    // .catch(function(error) {
    //   console.log("logout failed: " + error.message)
    // });
  }
  //End Firebase Auth//

  // Start MySql Auth //
  //http://www.nikola-breznjak.com/blog/javascript/ionic2/posting-data-from-ionic-2-app/

  // Login
  // doLogin(email: string, password: string): any {
  //   return new Promise((resolve, reject) => {
  //     let headers = new Headers();
  //     headers.append('Content-Type', 'application/json');
  //     var link = 'http://localhost:8888/ionic%20authentication/login.php';
  //     var data = JSON.stringify({
  //       email: email,//"dariodepa",
  //       password: password //"123456",
  //     }); 
  //     this.http.post(link, data)
  //     .subscribe(res => {
  //       console.log("XXXXXXXX: ",res);
  //       let data = res.json();
  //       let type = data.type;
  //       if (type != 'success'){
  //         let err = new Error(data.message);
  //         reject(err);
  //       }else{
  //         this.token = data.token;
  //         this.storage.set('token', data.token);
  //         resolve(data);
  //       }
  //     }, (err) => {
  //       console.log("Oooops!");
  //       reject(err);
  //     });
  //   });
  // }

  // // Register User
  // createAccount(username: string, email: string, password: string, name: string, surname: string){
  //   return new Promise((resolve, reject) => {
  //     let headers = new Headers();
  //     headers.append('Content-Type', 'application/json');
  //     var link = 'http://localhost:8888/ionic%20authentication/register.php';
  //     var data = JSON.stringify({
  //       username: username,//"dariodepa",
  //       email: email,//"czone555@gmail.com",
  //       password: password, //"123456",
  //       name: name,//"Dario DePa"
  //       surname: surname,//"Dario DePa"
  //       fullname: name+' '+surname//"Dario DePa"
  //     }); 
  //     this.http.post(link, data)
  //     .subscribe(res => {
  //       console.log("XXXXXXXX: ",res);
  //       let data = res.json();
  //       let type = data.type;
  //       if (type != 'success'){
  //         let err = new Error(data.message);
  //         reject(err);
  //       }else{
  //         this.token = data.token;
  //         this.storage.set('token', data.token);
  //         resolve(data);
  //       }
  //     }, (err) => {
  //       console.log("Oooops!");
  //       reject(err);
  //     });
  //   });
  // }
  // End MySql Auth //

}
