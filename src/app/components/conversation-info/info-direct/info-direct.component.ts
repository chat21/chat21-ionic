import { Component, OnInit, AfterViewInit, Input, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-info-direct',
  templateUrl: './info-direct.component.html',
  styleUrls: ['./info-direct.component.scss'],
})
export class InfoDirectComponent implements OnInit, AfterViewInit {
  @Input() member: any;
  @Input() translationMap: Map<string, string>;

  borderColor = '#ffffff';
  fontColor = '#949494';

  constructor() {
    console.log('InfoDirectComponent - constructor');
   }

  ngOnInit() {
    console.log('InfoDirectComponent - ngOnInit');
    this.initialize();
  }

  ngAfterViewInit() {
    console.log('InfoDirectComponent - ngAfterViewInit');
  }
  /** */
  initialize() {
    console.log('InfoDirectComponent - initialize');
    console.log(this.member);
  }

  openInfoAdvancedPage() {
    // openInfoAdvancedPage
  }

}
