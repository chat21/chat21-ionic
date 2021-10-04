import { Injectable } from '@angular/core';
import { Observable, Observer, fromEvent, merge, of } from 'rxjs';
import { mapTo } from 'rxjs/operators';
import { Platform } from '@ionic/angular';
import { Network } from '@ionic-native/network/ngx';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  public appIsOnline$: Observable<boolean> = undefined;
  checkInternet: boolean;

  constructor(
    private platform: Platform,
    private network: Network
  ) { }



  checkInternetFunc() {
    if (!window || !navigator || !('onLine' in navigator)) return;

    this.appIsOnline$ = Observable.create(observer => {
      observer.next(true);
    }).pipe(mapTo(true));

    if (this.platform.is('cordova')) {
      // on Device - when platform is cordova
      this.appIsOnline$ = merge(
        this.network.onConnect().pipe(mapTo(true)),
        this.network.onDisconnect().pipe(mapTo(false))
      );
    } else {
      // on Browser - when platform is Browser
      this.appIsOnline$ = merge(
        of(navigator.onLine),
        fromEvent(window, 'online').pipe(mapTo(true)),
        fromEvent(window, 'offline').pipe(mapTo(false))
      );
    }
    return this.appIsOnline$
  }

}