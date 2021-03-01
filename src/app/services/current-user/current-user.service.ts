import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

import { environment } from 'src/environments/environment';

// models
import { UserModel } from 'src/chat21-core/models/user';

// utils
import {
  avatarPlaceholder,
  getColorBck,
  getImageUrlThumbFromFirebasestorage
} from 'src/chat21-core/utils/utils-user';

@Injectable({
  providedIn: 'root'
})

// https://www.freakyjolly.com/ionic-httpclient-crud-service-tutorial-to-consume-restful-server-api/#.X6O9oVNKhuV
// https://www.techiediaries.com/ionic-http-post/
//

export class CurrentUserService {

  // BehaviorSubjects
  BScurrentUser: BehaviorSubject<UserModel> = new BehaviorSubject<UserModel>(null);

  // public
  SERVER_BASE_URL = environment.SERVER_BASE_URL;
  FIREBASESTORAGE_BASE_URL_IMAGE = environment.FIREBASESTORAGE_BASE_URL_IMAGE;
  urlStorageBucket = environment.firebaseConfig.storageBucket + '/o/profiles%2F';

  // private
  private urlUpdateCurrentUser: string;
  private urlDetailCurrentUser: string;
  private currentUser: UserModel;

  constructor(
    public http: HttpClient
  ) {
    console.log('CurrentUserService');
  }

  /**
   * initialize
   * @param tenant
   */
  initialize() {
    this.urlDetailCurrentUser = this.SERVER_BASE_URL + 'users';
    this.urlUpdateCurrentUser = this.SERVER_BASE_URL + 'users';
  }

  /**
   * detailCurrentUser
   * @param token
   */
  public detailCurrentUser(token: string) {
    const that = this;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        Authorization: token
      })
    };
    const postData = {
    };
    console.log('detailCurrentUser:: url ', this.urlDetailCurrentUser);
    this.http
    .get(this.urlDetailCurrentUser, httpOptions)
    .subscribe(user => {
      console.log('detailCurrentUser:: data ', user);
      that.createCompleteUser(user);
     }, error => {
      console.log('detailCurrentUser:: error ', error);
    });
  }

  /**
   * updateCurrentUser
   * @param user
   */
  public updateCurrentUser(user: any) {
    // updateUserDetail
  }

  /**
   * getCurrentUser
   * @param user
   */
  public getCurrentUser(user: any) {
    return this.currentUser;
  }


  /**
   * createCompleteUser
   * @param user
   */
  private createCompleteUser(user: any) {
    const member = new UserModel(user.uid);
    try {
      const uid = user._id;
      const firstname = user.firstname ? user.firstname : '';
      const lastname = user.lastname ? user.lastname : '';
      const email = user.email ? user.email : '';
      const fullname = ( firstname + ' ' + lastname ).trim();
      const avatar = avatarPlaceholder(fullname);
      const color = getColorBck(fullname);
      const imageurl = getImageUrlThumbFromFirebasestorage(user._id, this.FIREBASESTORAGE_BASE_URL_IMAGE, this.urlStorageBucket);
      member.uid = uid;
      member.email = email;
      member.firstname = firstname;
      member.lastname = lastname;
      member.fullname = fullname;
      member.imageurl = imageurl;
      member.avatar = avatar;
      member.color = color;
      console.log('createCompleteUser: ', member);
    } catch (err) {
      console.log('createCompleteUser error:' + err);
    }
    this.currentUser = member;
    // salvo nel local storage e sollevo l'evento
    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    this.BScurrentUser.next(this.currentUser);
  }
}
