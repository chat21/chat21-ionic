import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { TiledeskAuthService } from 'src/chat21-core/providers/tiledesk/tiledesk-auth.service';

@Component({
  selector: 'app-sidebar-user-details',
  templateUrl: './sidebar-user-details.component.html',
  styleUrls: ['./sidebar-user-details.component.scss'],
})
export class SidebarUserDetailsComponent implements OnInit, OnChanges {
  @Input() HAS_CLICKED_OPEN_USER_DETAIL: boolean = false;
  // @Output() onCloseUserDetailsSidebar = new EventEmitter();


  public browserLang: string;
  private logger: LoggerService = LoggerInstance.getInstance()
  chat_lang: string
  flag_url: string;
  constructor(
    private translate: TranslateService,
    public tiledeskAuthService: TiledeskAuthService
  ) { }

  ngOnInit() {
    this.getCurrentChatLang()
  }


  ngOnChanges() {
    console.log('[SIDEBAR-USER-DETAILS] HAS_CLICKED_OPEN_USER_DETAIL', this.HAS_CLICKED_OPEN_USER_DETAIL)
    var element = document.getElementById('user-details');
    console.log('[SIDEBAR-USER-DETAILS] element', element)
    if (this.HAS_CLICKED_OPEN_USER_DETAIL === true) {
      element.classList.add("active");
    }
  }

  closeUserDetailSidePanel() {
    var element = document.getElementById('user-details');
    element.classList.remove("active");
    console.log('[SIDEBAR-USER-DETAILS] element', element)
    // this.onCloseUserDetailsSidebar.emit(false);
  }

  getCurrentChatLang() {
    this.browserLang = this.translate.getBrowserLang();
    const currentUser = this.tiledeskAuthService.getCurrentUser();
    this.logger.log('[SIDEBAR-USER-DETAILS] - ngOnInit - currentUser ', currentUser)
    let currentUserId = ''
    if (currentUser) {
      currentUserId = currentUser.uid
      console.log('[SIDEBAR-USER-DETAILS] - ngOnInit - currentUserId ', currentUserId)
    }

    const stored_preferred_lang = localStorage.getItem(currentUserId + '_lang');
    console.log('[SIDEBAR-USER-DETAILS] stored_preferred_lang: ', stored_preferred_lang);


    this.chat_lang = ''
    if (this.browserLang && !stored_preferred_lang) {
      this.chat_lang = this.browserLang
      this.flag_url = "assets/images/language_flag/" + this.chat_lang + ".png"

      console.log('[SIDEBAR-USER-DETAILS] flag_url: ', this.flag_url);
      console.log('[SIDEBAR-USER-DETAILS] chat_lang: ', this.chat_lang);
    } else if (this.browserLang && stored_preferred_lang) {
      this.chat_lang = stored_preferred_lang
      this.flag_url = "assets/images/language_flag/" + this.chat_lang + ".png"
      console.log('[SIDEBAR-USER-DETAILS] flag_url: ', this.flag_url);
      console.log('[SIDEBAR-USER-DETAILS] chat_lang: ', this.chat_lang);
    }
  }

}
