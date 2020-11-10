import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})
export class DetailsPage implements OnInit, OnDestroy {

  conversationWith: string;
  conversationWithFullname: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.conversationWith = this.route.snapshot.paramMap.get('IDConv');
    this.conversationWithFullname = this.route.snapshot.paramMap.get('FullNameConv');
    console.log('constructor DetailsPage: ', this.conversationWith, this.conversationWithFullname);
  }

  ngOnInit() {
    this.conversationWith = this.route.snapshot.paramMap.get('IDConv');
    this.conversationWithFullname = this.route.snapshot.paramMap.get('FullNameConv');
    console.log('ngOnInit DetailsPage: ', this.conversationWith, this.conversationWithFullname);
  }

  // ngOnDestroy() {
  //   this.conversationWith = this.route.snapshot.paramMap.get('IDConv');
  //   this.conversationWithFullname = this.route.snapshot.paramMap.get('FullNameConv');
  //   console.log('ngOnDestroy DetailsPage: ', this.conversationWith, this.conversationWithFullname);
  //   // this.destroyParent();
  // }

  @HostListener("window:beforeunload")
  ngOnDestroy() {
    console.log("Parent component destroyed")
  }

  ionViewWillEnter() {
    this.conversationWith = this.route.snapshot.paramMap.get('IDConv');
    this.conversationWithFullname = this.route.snapshot.paramMap.get('FullNameConv');
    console.log('ionViewWillEnter DetailsPage: ', this.conversationWith, this.conversationWithFullname);
  }

  /** */
  ionViewDidEnter() {
    this.conversationWith = this.route.snapshot.paramMap.get('IDConv');
    this.conversationWithFullname = this.route.snapshot.paramMap.get('FullNameConv');
    console.log('ionViewDidEnter DetailsPage: ', this.conversationWith, this.conversationWithFullname);
  }

  ionViewWillLeave() {
    this.conversationWith = this.route.snapshot.paramMap.get('IDConv');
    this.conversationWithFullname = this.route.snapshot.paramMap.get('FullNameConv');
    console.log('ionViewWillLeave DetailsPage: ', this.conversationWith, this.conversationWithFullname);
  }

}
