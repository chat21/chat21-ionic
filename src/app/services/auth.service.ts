import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export abstract class AuthService {

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
