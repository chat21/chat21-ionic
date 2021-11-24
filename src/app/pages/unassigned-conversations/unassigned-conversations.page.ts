import { Component, Input, OnInit, SecurityContext } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NavProxyService } from 'src/app/services/nav-proxy.service';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { DomSanitizer } from '@angular/platform-browser'
import { CustomTranslateService } from 'src/chat21-core/providers/custom-translate.service';


@Component({
  selector: 'app-unassigned-conversations',
  templateUrl: './unassigned-conversations.page.html',
  styleUrls: ['./unassigned-conversations.page.scss'],
})
export class UnassignedConversationsPage implements OnInit {

  @Input() unassigned_convs_url: any;
  unassigned_convs_url_sanitized: any;
  private logger: LoggerService = LoggerInstance.getInstance();
  has_loaded: boolean;
  ion_content: any;
  iframe: any;
  public translationMap: Map<string, string>;
  constructor(
    private modalController: ModalController,
    private navService: NavProxyService,
    private sanitizer: DomSanitizer,
    private translateService: CustomTranslateService,
  ) { }

  ngOnInit() {
    const keys = ['UnassignedConversations'];
    this.translationMap = this.translateService.translateLanguage(keys);

    console.log('[UNASSIGNED-CONVS-PAGE] - UNASSIGNED CONVS URL (ngOnInit)', this.unassigned_convs_url);
    // this.unassigned_convs_url_sanitized = this.sanitizer.bypassSecurityTrustResourceUrl(this.unassigned_convs_url);
    // this.unassigned_convs_url_sanitized = this.sanitizer.bypassSecurityTrustHtml(this.unassigned_convs_url);
    this.unassigned_convs_url_sanitized = this.sanitizer.sanitize(SecurityContext.URL, this.unassigned_convs_url)
    console.log('[UNASSIGNED-CONVS-PAGE] - UNASSIGNED CONVS URL SANITIZED (ngOnInit)', this.unassigned_convs_url_sanitized);
    this.has_loaded = false

    this.ion_content = document.getElementById("iframe-ion-content");
    this.iframe = document.createElement("iframe");
    this.iframe.src = this.unassigned_convs_url_sanitized;
    this.iframe.width = "100%";
    this.iframe.height = "99%";
    this.iframe.id = "unassigned-convs-iframe"
    this.iframe.frameBorder = "0";
    this.iframe.style.border = "none";
    this.iframe.style.background = "white";
    this.ion_content.appendChild(this.iframe);

    // }

    // window.addEventListener("message", (event) => {
    //   console.log("[UNASSIGNED-CONVS-PAGE] message event ", event);

    //   if (event && event.data) {
    //     if (event.data === 'finished') {
    //       this.has_loaded = true

    //     }
    //   }
    // });

  }

  

  // getIframeHaLoaded() {
  //   var self = this;
  //   var iframe = document.getElementById('i_frame') as HTMLIFrameElement;;
  //   if (iframe) {
  //     iframe.addEventListener("load", function () {
  //       console.log("[UNASSIGNED-CONVS-PAGE] GET - Finish");
  //       self.has_loaded = true
    

  //     });
  //   }
  // }

  //   loadDeferredIframe(unassigned_convs_url_sanitized) {
  //     // this function will load the Google homepage into the iframe
  //     var iframe = document.getElementById("my-deferred-iframe");
  //     iframe.src = "./" // here goes your url
  // };


  async onClose() {
    console.log('[UNASSIGNED-CONVS-PAGE] - onClose MODAL')
    console.log('[UNASSIGNED-CONVS-PAGE] - onClose MODAL isModalOpened ', await this.modalController.getTop())
    const isModalOpened = await this.modalController.getTop();

    if (isModalOpened) {
      this.modalController.dismiss({

        confirmed: true
      });
    } else {
      this.navService.pop();
    }
  }

}
