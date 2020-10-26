import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export abstract class UserService {

    abstract initialize(tenant: string): void;

    abstract loadUserDetail(userID: string): any;

    abstract loadCurrentUserDetail(): any;

    abstract updateUserDetail(user: any): void;
}
