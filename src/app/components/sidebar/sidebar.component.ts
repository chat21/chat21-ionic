import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppConfigProvider } from 'src/app/services/app-config';
import { AppStorageService } from 'src/chat21-core/providers/abstract/app-storage.service';
import { ImageRepoService } from 'src/chat21-core/providers/abstract/image-repo.service';
import { CustomTranslateService } from 'src/chat21-core/providers/custom-translate.service';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  USER_ROLE: string;
  SIDEBAR_IS_SMALL = true
  IS_AVAILABLE = true
  user:any;
  IS_BUSY:boolean;

  isVisibleAPP: boolean = true
  isVisibleANA: boolean = true
  isVisibleACT: boolean = true
  photo_profile_URL: string;
project_id: string;
DASHBOARD_URL: string;
public translationMap: Map<string, string>;

  constructor(
    public imageRepoService: ImageRepoService,
    public appStorageService: AppStorageService,
   
    public appConfig: AppConfigProvider,
    private translateService: CustomTranslateService
  ) { }

  ngOnInit() {
    this.DASHBOARD_URL = this.appConfig.getConfig().dashboardUrl + '#/project/';
    console.log('[SIDEBAR] DASHBOARD_URL ', this.DASHBOARD_URL )
  
    const currentUser = JSON.parse(this.appStorageService.getItem('currentUser'));
    console.log('[SIDEBAR] currentUser ', currentUser)
    if (currentUser) {
      this.photo_profile_URL = this.imageRepoService.getImagePhotoUrl(currentUser.uid)
      console.log('[SIDEBAR] photo_profile_URL ', this.photo_profile_URL)
    }

    this.getSoredProjectAndDashboardBaseUrl()
  }

  getSoredProjectAndDashboardBaseUrl() {
    const stored_project = localStorage.getItem('last_project')
    // console.log('[SIDEBAR] stored_project ', stored_project)
    if (stored_project) {
      const project = JSON.parse(stored_project)
      console.log('[SIDEBAR] project ', project)

      this.project_id = project.id_project.id
      console.log('[SIDEBAR] project_id ', this.project_id)

      this.USER_ROLE = project.role;
      console.log('[SIDEBAR] USER_ROLE ', this.USER_ROLE)
    }
  }

  goToHome() {
    let url =  this.DASHBOARD_URL + this.project_id  + '/home'
    const myWindow = window.open(url, '_self');
    myWindow.focus();
  }

  goToConversations() { 
    let url =  this.DASHBOARD_URL + this.project_id  + '/wsrequests'
    const myWindow = window.open(url, '_self');
    myWindow.focus();
  }

  goToContacts() { 
    let url =  this.DASHBOARD_URL + this.project_id  + '/contacts'
    const myWindow = window.open(url, '_self');
    myWindow.focus();
  }

  goToAppStore() { 
    let url =  this.DASHBOARD_URL + this.project_id  + '/app-store'
    const myWindow = window.open(url, '_self');
    myWindow.focus();
  }


  goToAnalytics() { 
    let url =  this.DASHBOARD_URL + this.project_id  + '/analytics'
    const myWindow = window.open(url, '_self');
    myWindow.focus();
  }


  goToActivities() { 
    let url =  this.DASHBOARD_URL + this.project_id  + '/activities'
    const myWindow = window.open(url, '_self');
    myWindow.focus();
  }

  goToHistory() { 
    let url =  this.DASHBOARD_URL + this.project_id  + '/history'
    const myWindow = window.open(url, '_self');
    myWindow.focus();
  }

  goToSettings_CannedResponses() { 
    let url =  this.DASHBOARD_URL + this.project_id  + '/cannedresponses'
    const myWindow = window.open(url, '_self');
    myWindow.focus();
  }

  public translations() {
    const keys = [
      'Available',
      'Unavailable',
      'Busy',
      'VIEW_ALL_CONVERSATIONS',
      'CONVERSATIONS_IN_QUEUE',
      'CONVERSATION_IN_QUEUE',
      'NO_CONVERSATION_IN_QUEUE',
      'PINNED_PROJECT',
      'CHANGE_PINNED_PROJECT',
      "CHANGE_TO_YOUR_STATUS_TO_AVAILABLE",
      "CHANGE_TO_YOUR_STATUS_TO_UNAVAILABLE"
    ];
    this.translationMap = this.translateService.translateLanguage(keys);
  }


  changeAvailabilityState(IS_AVAILABLE) { 
    
  }
  

  
  


  






}




