import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AppStorageService } from 'src/chat21-core/providers/abstract/app-storage.service';
import { ImageRepoService } from 'src/chat21-core/providers/abstract/image-repo.service';
import 'rxjs/add/operator/filter'
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  USER_ROLE = 'owner'
  SIDEBAR_IS_SMALL = true
  IS_AVAILABLE = true

  isVisibleAPP: boolean = true
  isVisibleANA: boolean = true
  isVisibleACT: boolean = true
  photo_profile_URL: string;


  constructor(
    public imageRepoService: ImageRepoService,
    public appStorageService: AppStorageService,
    private router: Router,
  ) { }

  ngOnInit() {
    const currentUser = JSON.parse(this.appStorageService.getItem('currentUser'));
    console.log('[SIDEBAR] currentUser ', currentUser)
    if (currentUser) {
      this.photo_profile_URL = this.imageRepoService.getImagePhotoUrl(currentUser.uid)
      console.log('[SIDEBAR] photo_profile_URL ', this.photo_profile_URL)
    }

    // this.getCurrentRoute();
  }


  // getCurrentRoute() {
  //   this.router.events.filter((event: any) => event instanceof NavigationEnd)
  //       .subscribe(event => { })
  
  // }

}




