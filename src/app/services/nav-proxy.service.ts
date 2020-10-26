import { Injectable } from '@angular/core';
import { IonicModule, IonNav, IonRouterOutlet } from '@ionic/angular';
import { Router, NavigationExtras } from '@angular/router';

// utils
import { checkPlatformIsMobile } from '../utils/utils';
// import { ConversationDetailPage } from '../pages/conversation-detail/conversation-detail.page';

@Injectable({
  providedIn: 'root'
})
export class NavProxyService {
  public sidebarNav: IonNav = null;
  public detailNav: IonRouterOutlet = null;
  constructor(
    public router: Router
  ) {
  }

  init(sidebarNav: IonNav, detailNav: IonRouterOutlet) {
    this.sidebarNav = sidebarNav;
    this.detailNav = detailNav;
  }

  setRoot(page: any, navExtra: any) {
    this.sidebarNav.setRoot(page, navExtra);
  }
  pop() {
    this.sidebarNav.pop();
  }
  push(page: any, navExtra: any) {
    this.sidebarNav.push(page, navExtra);
  }

  pushSidebar(page: any, pageName: string, navExtra?) {
    console.log('push2:', pageName, 'navExtra():', navExtra, 'this.sidebarNav', this.sidebarNav);
    if (checkPlatformIsMobile()) {
      this.router.navigate([pageName], navExtra);
    } else {
      this.sidebarNav.push(page, navExtra);
    }
  }





  openPage(pageName: string, page: any, navExtra?: NavigationExtras) {
    console.log('openPage:', pageName, 'navExtra():', navExtra);
    this.router.navigate([pageName], navExtra);
  }

  closePage(pageName: string) {
    console.log('closePage:', pageName, 'checkPlatformIsMobile():', checkPlatformIsMobile());
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
