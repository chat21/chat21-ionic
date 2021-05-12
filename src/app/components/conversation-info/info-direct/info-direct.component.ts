import { Component, OnInit, AfterViewInit, Input, EventEmitter, OnChanges } from '@angular/core';
import { ImageRepoService } from 'src/chat21-core/providers/abstract/image-repo.service';

@Component({
  selector: 'app-info-direct',
  templateUrl: './info-direct.component.html',
  styleUrls: ['./info-direct.component.scss'],
})
export class InfoDirectComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() member: any;
  @Input() translationMap: Map<string, string>;
  @Input() conversationWith: string;

  borderColor = '#ffffff';
  fontColor = '#949494';
  advancedAttributes: Array<any> = [];
  
  constructor(
    public imageRepoService: ImageRepoService
  ) {
    console.log('InfoDirectComponent - constructor');
   }

  ngOnInit() {
    console.log('InfoDirectComponent - ngOnInit');
  
    this.initialize();
  }

  ngAfterViewInit() {
    console.log('InfoDirectComponent - ngAfterViewInit');
    console.log('InfoDirectComponent member', this.member);
    console.log('InfoDirectComponent conversationWith', this.conversationWith);
  }


  ngOnChanges(){
    this.member.imageurl = this.imageRepoService.getImagePhotoUrl(this.conversationWith)

  }
  /** */
  initialize() {
    console.log('InfoDirectComponent - initialize');
    this.advancedAttributes.push({key: "ID_CONVERSATION", value: this.conversationWith, icon: 'code'})
    console.log('InfoDirectComponent - advancedAttributes' , this.advancedAttributes);
  }

  openInfoAdvancedPage() {
    // openInfoAdvancedPage
  }

}
