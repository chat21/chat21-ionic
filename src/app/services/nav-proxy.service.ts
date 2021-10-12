import { Injectable } from '@angular/core';
import { IonicModule, IonNav, IonRouterOutlet } from '@ionic/angular';
import { Router, NavigationExtras } from '@angular/router';

// utils
import { checkPlatformIsMobile } from '../../chat21-core/utils/utils';
// import { ConversationDetailPage } from '../pages/conversation-detail/conversation-detail.page';

import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';

@Injectable({
  providedIn: 'root'
})
export class NavProxyService {
  public sidebarNav: IonNav = null;
  public detailNav: IonRouterOutlet = null;
  private logger: LoggerService = LoggerInstance.getInstance();

  constructor(
    public router: Router
  ) { }

  init(sidebarNav: IonNav, detailNav: IonRouterOutlet) {
  
    this.sidebarNav = sidebarNav;
    this.detailNav = detailNav;
    this.logger.info('[NAV-SERV] initialize sidebarNav', sidebarNav, ' detailNav', detailNav);
  }

  setRoot(page: any, navExtra: any) {
    this.logger.log('[NAV-SERV] setRoot page', page, ' navExtra', navExtra);
    this.sidebarNav.setRoot(page, navExtra);
  }

  pop() {
    this.sidebarNav.pop();
  }

  push(page: any, navExtra: any) {
    this.sidebarNav.push(page, navExtra);
  }




  openPage(pageName: string, page: any, navExtra?: NavigationExtras) {
    this.logger.log('[NAV-SERV] openPage pageName:', pageName, ' page:', page, ' navExtra: ',  navExtra);
    this.router.navigate([pageName], navExtra);
  }


    // !!!! SEEMS NOT USED
    pushSidebar(page: any, pageName: string, navExtra?) {
      this.logger.log('push2:', pageName, 'navExtra():', navExtra, 'this.sidebarNav', this.sidebarNav);
      if (checkPlatformIsMobile()) {
        this.router.navigate([pageName], navExtra);
      } else {
        this.sidebarNav.push(page, navExtra);
      }
    }
  


   // !!!! SEEMS NOT USED
  closePage(pageName: string) {
    this.logger.log('closePage:', pageName, 'checkPlatformIsMobile():', checkPlatformIsMobile());
    if (checkPlatformIsMobile()) {
      const navigationExtras: NavigationExtras = {
        state: {
          eventSelected: ''
        }
      };
      this.router.navigate([pageName], navigationExtras);
      // this.router.navigateByUrl(pageName);
    } else {
      this.pop();
    }
  }
}
