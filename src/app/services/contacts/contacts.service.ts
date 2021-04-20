import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
// import {FIREBASESTORAGE_BASE_URL_IMAGE} from 'src/chat21-core/utils/constants'
// models
import { UserModel } from 'src/chat21-core/models/user';

// utils
import {
  avatarPlaceholder,
  getColorBck,
  getImageUrlThumbFromFirebasestorage
} from 'src/chat21-core/utils/utils-user';
import { AppConfigProvider } from '../app-config';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})

export class ContactsService {

  // BehaviorSubjects
  BScontacts: BehaviorSubject<UserModel[]> = new BehaviorSubject<UserModel[]>(null);
  BScontactDetail: BehaviorSubject<UserModel> = new BehaviorSubject<UserModel>(null);

  // private
  private urlRemoteContacts: string;
  private contacts: UserModel[];
  private FIREBASESTORAGE_BASE_URL_IMAGE: string;
  private urlStorageBucket: string;

  constructor(
    public http: HttpClient,
    public appConfigProvider: AppConfigProvider
  ) {
    console.log('ContactsService');

    this.urlRemoteContacts = appConfigProvider.getConfig().apiUrl + 'chat21/contacts';
    this.FIREBASESTORAGE_BASE_URL_IMAGE = appConfigProvider.getConfig().baseImageUrl;
    this.urlStorageBucket = appConfigProvider.getConfig().firebaseConfig.storageBucket + '/o/profiles%2F';

  }


  // initialize() {}

  /** */
  public loadContactsFromUrl(token: string) {
    this.contacts = [];
    if (this.urlRemoteContacts.startsWith('http') && token) {
      const that = this;
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: token
        })
      };
      const postData = {
      };
      console.log('urlRemoteContacts:: url ', this.urlRemoteContacts);
      this.http.get<any[]>(this.urlRemoteContacts, httpOptions).subscribe(users => {
        console.log('urlRemoteContacts:: data ', users);
        users.forEach(user => {
          const member = that.createCompleteUser(user);
          that.contacts.push(member);
        });
        localStorage.setItem('contacts', JSON.stringify(this.contacts));
        this.BScontacts.next(this.contacts);
      }, error => {
        console.log('urlRemoteContacts:: error ', error);
      });
    }
  }



  public _loadContactDetail(token: string, uid: string) {
    this.contacts = [];
    console.log('loadContactDetail:: uid ', uid);
    const urlRemoteContactDetail = this.urlRemoteContacts + '/' + uid;
    if (urlRemoteContactDetail.startsWith('http') && token) {
      const that = this;
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: token
        })
      };
      const postData = {
      };
      console.log('INFO-CONTENT-COMP (contact-service) loadContactDetail:: url ', urlRemoteContactDetail);
      this.http
        .get<any>(urlRemoteContactDetail, httpOptions)
        .subscribe(user => {
          console.log('INFO-CONTENT-COMP (contact-service) loadContactDetail:: data ', user);
          const member = that.createCompleteUser(user);
          this.BScontactDetail.next(member);
        }, error => {
          console.log('urlRemoreContactDetail:: error ', error);
        });
    }
  }

  /**
  * 
  * @param token
  * @param uid
  */
  public loadContactDetail(token: string, uid: string) {
    this.contacts = [];
    console.log('INFO-CONTENT-COMP (contact-service) - loadContactDetail:: uid ', uid);
    const urlRemoteContactDetail = this.urlRemoteContacts + '/' + uid;
    if (urlRemoteContactDetail.startsWith('http') && token) {

      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: token
        })
      };
      // const postData = {};
      console.log('loadContactDetail:: url ', urlRemoteContactDetail);
      return this.http
        .get(urlRemoteContactDetail, httpOptions)
        .pipe(map((res: any) => {
          console.log('INFO-CONTENT-COMP (contact-service) - loadContactDetail RES ', res);
          if (res.uid) {
            let user = this.createCompleteUser(res)
            return user
          }
        }))

    }
  }


  /**
   * createCompleteUser
   * @param user
   */
  private createCompleteUser(user: any): UserModel {
    console.log('INFO-CONTENT-COMP (contact-service) - createCompleteUser !!!  ');
    const member = new UserModel(user.uid);
    try {
      const uid = user.uid;
      const firstname = user.firstname ? user.firstname : '';
      const lastname = user.lastname ? user.lastname : '';
      const email = user.email ? user.email : '';
      const fullname = (firstname + ' ' + lastname).trim();
      const avatar = avatarPlaceholder(fullname);
      const color = getColorBck(fullname);
      const imageurl = getImageUrlThumbFromFirebasestorage(user.uid, this.FIREBASESTORAGE_BASE_URL_IMAGE, this.urlStorageBucket);
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
    return member;
  }

}
