import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { EventsService } from '../../services/events-service';

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})
export class DetailsPage implements OnInit {


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public events: EventsService
  ) { }

  ngOnInit() {
    //this.events.subscribe('resize_', this.onResizeWindow);
    // if(window.innerWidth < 768){
    //   this.navigatePage();
    // }
  }

  ionViewDidEnter() {
    console.log('app-details ------------> ionViewDidEnter');
  }

  // onResizeWindow = (type: string) => {
  //   console.log('resize_', type);
  //   if(type === 'mobile'){
  //     this.navigatePage();
  //   }
  // }

  // private navigatePage(){
  //   this.router.navigateByUrl('conversations-list');
  // }



}
