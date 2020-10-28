import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export abstract class AuthService {

  abstract authStateChanged: BehaviorSubject<any> = new BehaviorSubject<any>([]);

  abstract persistence = environment.authPersistence;
  abstract SERVER_BASE_URL = environment.SERVER_BASE_URL;

  abstract initialize(tenant: string): void;

  abstract getUser();

  abstract getToken();

  // abstract onAuthStateChanged();

  // abstract updateTokenOnAuthStateIsLogin(userUid);

  // abstract doLoginFirebase(email: string, password: string);

  // abstract signInWithCustomToken(token);

  abstract signInWithEmailAndPassword(email: string, password: string): void;

  // abstract createUserWithEmailAndPassword(email: string, password: string);

  // abstract delete();

  // abstract sendPasswordResetEmail(email: string);

  // abstract signOut();

}
