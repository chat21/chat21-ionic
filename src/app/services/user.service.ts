import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

// models
import { UserModel } from 'src/app/models/user';

@Injectable({
  providedIn: 'root'
})

export abstract class UserService {

  // params
  abstract FIREBASESTORAGE_BASE_URL_IMAGE = environment.FIREBASESTORAGE_BASE_URL_IMAGE;
  abstract urlStorageBucket = environment.firebaseConfig.storageBucket + '/o/profiles%2F';

  abstract initialize(tenant: string): void;
  abstract loadUserDetail(userID: string): any;
  abstract loadCurrentUserDetail(): any;
  abstract updateUserDetail(user: any): void;
}
