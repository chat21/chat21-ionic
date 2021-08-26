import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// Logger
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})
export class DetailsPage implements OnInit, OnDestroy {

  conversationWith: string;
  conversationWithFullname: string;
  private logger: LoggerService = LoggerInstance.getInstance();
  constructor(
    private route: ActivatedRoute,
    private router: Router
    
  ) {
    this.conversationWith = this.route.snapshot.paramMap.get('IDConv');
    this.conversationWithFullname = this.route.snapshot.paramMap.get('FullNameConv');
    this.logger.log('constructor DetailsPage: ', this.conversationWith, this.conversationWithFullname);
  }

  ngOnInit() {
    this.conversationWith = this.route.snapshot.paramMap.get('IDConv');
    this.conversationWithFullname = this.route.snapshot.paramMap.get('FullNameConv');
    this.logger.log('ngOnInit DetailsPage: ', this.conversationWith, this.conversationWithFullname);
  }

  // ngOnDestroy() {
  //   this.conversationWith = this.route.snapshot.paramMap.get('IDConv');
  //   this.conversationWithFullname = this.route.snapshot.paramMap.get('FullNameConv');
  //   this.logger.log('ngOnDestroy DetailsPage: ', this.conversationWith, this.conversationWithFullname);
  //   // this.destroyParent();
  // }

  @HostListener("window:beforeunload")
  ngOnDestroy() {
    this.logger.log("Parent component destroyed")
  }

  ionViewWillEnter() {
    this.conversationWith = this.route.snapshot.paramMap.get('IDConv');
    this.conversationWithFullname = this.route.snapshot.paramMap.get('FullNameConv');
    this.logger.log('ionViewWillEnter DetailsPage: ', this.conversationWith, this.conversationWithFullname);
  }

  /** */
  ionViewDidEnter() {
    this.conversationWith = this.route.snapshot.paramMap.get('IDConv');
    this.conversationWithFullname = this.route.snapshot.paramMap.get('FullNameConv');
    this.logger.log('ionViewDidEnter DetailsPage: ', this.conversationWith, this.conversationWithFullname);
  }

  ionViewWillLeave() {
    this.conversationWith = this.route.snapshot.paramMap.get('IDConv');
    this.conversationWithFullname = this.route.snapshot.paramMap.get('FullNameConv');
    this.logger.log('ionViewWillLeave DetailsPage: ', this.conversationWith, this.conversationWithFullname);
  }

}
