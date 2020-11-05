import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

import { environment } from 'src/environments/environment';

// models
import { UserModel } from 'src/app/models/user';

@Injectable({
  providedIn: 'root'
})

// https://www.freakyjolly.com/ionic-httpclient-crud-service-tutorial-to-consume-restful-server-api/#.X6O9oVNKhuV
// https://www.techiediaries.com/ionic-http-post/
//

export class CurrentUserService {
  BScurrentUser: BehaviorSubject<UserModel> = new BehaviorSubject<UserModel>(null);

  SERVER_BASE_URL = environment.SERVER_BASE_URL;
  FIREBASESTORAGE_BASE_URL_IMAGE = environment.FIREBASESTORAGE_BASE_URL_IMAGE;
  urlStorageBucket = environment.firebaseConfig.storageBucket + '/o/profiles%2F';

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
   *
   * @param user
   */
  public updateCurrentUser(user: any) {
    // updateUserDetail
  }

  /**
   *
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
      const avatar = this.avatarPlaceholder(fullname);
      const color = this.getColorBck(fullname);
      const imageurl = this.getImageUrlThumbFromFirebasestorage(user._id);
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



  /**
   *
   * @param str
   */
  private getColorBck(str: string): string {
    const arrayBckColor = ['#fba76f', '#80d066', '#73cdd0', '#ecd074', '#6fb1e4', '#f98bae'];
    let num = 0;
    if (str) {
      const code = str.charCodeAt((str.length - 1));
      num = Math.round(code % arrayBckColor.length);
    }
    return arrayBckColor[num];
  }

  /**
   *
   * @param name
   */
  private avatarPlaceholder(name: string) {
    let initials = '';
    if (name) {
      const arrayName = name.split(' ');
      arrayName.forEach(member => {
        if (member.trim().length > 1 && initials.length < 3) {
          initials += member.substring(0, 1).toUpperCase();
        }
      });
    }
    return initials;
  }

  /**
   *
   * @param uid
   */
  private getImageUrlThumbFromFirebasestorage(uid: string) {
    const imageurl = this.FIREBASESTORAGE_BASE_URL_IMAGE + this.urlStorageBucket + uid + '%2Fthumb_photo.jpg?alt=media';
    return imageurl;
  }

}

