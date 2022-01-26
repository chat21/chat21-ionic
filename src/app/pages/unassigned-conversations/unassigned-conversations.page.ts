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

  @Input() iframe_URL: any;
  @Input() callerBtn: string;
  // @Input() prjctsxpanel_url: any;
  // @Input() unassigned_convs_url: any;

  iframe_url_sanitized: any;
  private logger: LoggerService = LoggerInstance.getInstance();
  // has_loaded: boolean;
  ion_content: any;
  iframe: any;

  isProjectsForPanel: boolean = false

  public translationMap: Map<string, string>;
  constructor(
    private modalController: ModalController,
    private navService: NavProxyService,
    private sanitizer: DomSanitizer,
    private translateService: CustomTranslateService,
  ) { }

  ngOnInit() {
    const keys = [
      'UnassignedConversations',
      'NewConversations',
      'PIN_A_PROJECT'
    ];
    this.translationMap = this.translateService.translateLanguage(keys);
    this.buildIFRAME();
    this.listenToPostMsg();
    this.hideHotjarFeedbackBtn();
  }

  hideHotjarFeedbackBtn() {
    const hotjarFeedbackBtn = <HTMLElement>document.querySelector("#_hj_feedback_container > div > button")
    if (hotjarFeedbackBtn) {
      hotjarFeedbackBtn.style.display = "none";
    }
  }

  buildIFRAME() {
    this.logger.log('[UNASSIGNED-CONVS-PAGE] - iframe_URL (ngOnInit)', this.iframe_URL);
    this.logger.log('[UNASSIGNED-CONVS-PAGE] - callerBtn (ngOnInit)', this.callerBtn);

    this.iframe_url_sanitized = this.sanitizer.sanitize(SecurityContext.URL, this.iframe_URL)
    this.logger.log('[UNASSIGNED-CONVS-PAGE] - UNASSIGNED CONVS URL SANITIZED (ngOnInit)', this.iframe_url_sanitized);
    // this.has_loaded = false

    this.ion_content = document.getElementById("iframe-ion-content");
    this.iframe = document.createElement("iframe");
    this.iframe.src = this.iframe_url_sanitized;
    this.iframe.width = "100%";
    this.iframe.height = "99%";
    this.iframe.id = "unassigned-convs-iframe"
    this.iframe.frameBorder = "0";
    this.iframe.style.border = "none";
    this.iframe.style.background = "white";
    this.ion_content.appendChild(this.iframe);

    this.getIframeHaLoaded()

  }

  getIframeHaLoaded() {
    var self = this;
    var iframeWin = document.getElementById('unassigned-convs-iframe') as HTMLIFrameElement;;
    this.logger.log('[UNASSIGNED-CONVS-PAGE] GET iframe ', iframeWin)
    if (iframeWin) {
      iframeWin.addEventListener("load", function () {
        self.logger.log("[UNASSIGNED-CONVS-PAGE] GET - Finish");

        const isIFrame = (input: HTMLElement | null): input is HTMLIFrameElement =>
          input !== null && input.tagName === 'IFRAME';

        if (isIFrame(iframeWin) && iframeWin.contentWindow) {
          const msg = { action: "hidewidget", calledBy: 'unassigned-convs' }
          iframeWin.contentWindow.postMessage(msg, '*');
        }


        let spinnerElem = <HTMLElement>document.querySelector('.loader-spinner-wpr')

        self.logger.log('[APP-STORE-INSTALL] GET iframeDoc readyState spinnerElem', spinnerElem)
        spinnerElem.classList.add("hide-stretchspinner")

      });
    }

  }

  listenToPostMsg() {
    window.addEventListener("message", (event) => {
      // console.log("[UNASSIGNED-CONVS-PAGE] message event ", event);

      if (event && event.data) {
        if (event.data === 'onInitProjectsForPanel') {
          this.isProjectsForPanel = true;
        }
        if (event.data === 'onDestroyProjectsForPanel') {
          this.isProjectsForPanel = false;
        }
      }

      if (event.data === 'hasChangedProject') {
        this.closemodal()
      }
    });
  }

  public async closemodal() {
    // const modal = await this.modalController.getTop();
    // modal.dismiss({
    //   confirmed: true
    // });
    // await this.modalController.dismiss({ confirmed: true });
    this.onClose()

  }


  async onClose() {
    this.logger.log('[UNASSIGNED-CONVS-PAGE] - onClose MODAL')
    this.logger.log('[UNASSIGNED-CONVS-PAGE] - onClose MODAL isModalOpened ', await this.modalController.getTop())
    const isModalOpened = await this.modalController.getTop();
    this.logger.log('[UNASSIGNED-CONVS-PAGE] - onClose MODAL isModalOpened ', isModalOpened)
    if (isModalOpened) {
      this.modalController.dismiss({
        confirmed: true
      });
    } else {
      this.navService.pop();
    }
  }

}
