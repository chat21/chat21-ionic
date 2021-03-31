import { Component, EventEmitter, Input, IterableDiffers, KeyValueDiffer, KeyValueDiffers, OnInit, Output, SimpleChanges } from '@angular/core';
import { FIREBASESTORAGE_BASE_URL_IMAGE } from 'src/chat21-core/utils/constants';
import { ConversationModel } from '../../../../chat21-core/models/conversation';
import { ImageRepoService } from '../../../../chat21-core/providers/abstract/image-repo.service';
//import {FIREBASESTORAGE_BASE_URL_IMAGE} from '../../utils/constants'

@Component({
  selector: 'tiledeskwidget-list-conversations',
  templateUrl: './list-conversations.component.html',
  styleUrls: ['./list-conversations.component.scss']
})
export class ListConversationsComponent implements OnInit {

  // ========= begin:: Input/Output values ============//
  @Input() listConversations: Array<ConversationModel>;
  @Input() limit?: number
  @Input() styleMap: Map<string, string>;
  @Input() translationMap: Map< string, string>;
  @Output() onConversationSelected = new EventEmitter<ConversationModel>();
  @Output() onImageLoaded = new EventEmitter<ConversationModel>();
  @Output() onConversationLoaded = new EventEmitter<ConversationModel>();
  // ========= end:: Input/Output values ============//

  iterableDifferListConv: any;
  uidConvSelected: string;
  constructor(public iterableDiffers: IterableDiffers,
              public imageRepoService: ImageRepoService) {
          this.iterableDifferListConv = this.iterableDiffers.find([]).create(null);
              }

  ngOnInit() {
    console.log(' ngOnInit::::list-conversations ', this.listConversations);
    
  }

  private openConversationByID(conversation) {
    console.log('openConversationByID: ', conversation);
    if ( conversation ) {
      // this.conversationsService.updateIsNew(conversation);
      // this.conversationsService.updateConversationBadge();
      this.uidConvSelected = conversation.uid
      this.onConversationSelected.emit(conversation);
    }
  }

  ngAfterViewInit() {
    console.log(' --------ngAfterViewInit: list-conversations-------- ', this.listConversations);
  }

  // ngOnChanges(changes: SimpleChanges){
  //   if(changes && changes['listConversations'] && changes['listConversations'].currentValue !== undefined){
  //     //this.differ = this.differs.find(this.listConversations).create();
  //     this.objDiffers = this.differs.find([]).create();  
  //     this.listConversations.forEach((itemGroup, index) => {
  //       this.objDiffers[index] = this.differs.find(itemGroup).create();
  //       this.differ[index] = itemGroup;
  //     });
  //   }
  //   console.log('ssssssss 1111', changes, this.objDiffers)
  // }


  // ngDoCheck() {
  //   let changesListConversation = this.iterableDifferListConv.diff(this.listConversations);
  //   if (changesListConversation) {
  //     this.listConversations.forEach(conv => {
  //       conv.image = this.imageRepoService.getImagePhotoUrl(FIREBASESTORAGE_BASE_URL_IMAGE, conv.sender)
  //       this.onImageLoad.emit(conv)
  //     });
  //   }
  // }
  
  ngDoCheck() {
    let changesListConversation = this.iterableDifferListConv.diff(this.listConversations);
    if(changesListConversation){
      changesListConversation.forEachAddedItem(element => {
        //console.log('1111 added ', element)
        let conv = element.item
        // conv.image = this.imageRepoService.getImagePhotoUrl(FIREBASESTORAGE_BASE_URL_IMAGE, conv.sender)
        this.onImageLoaded.emit(conv)
        this.onConversationLoaded.emit(conv)
      });
      changesListConversation.forEachRemovedItem(element => {
        //console.log('1111 removed ', element)
      });
      //Detect changes in array when item added or removed
      // let empArrayChanges = this.objDiffers.diff(this.listConversations);
      // if (empArrayChanges) {
      //   console.log('... Array changes ...', empArrayChanges);
      //   empArrayChanges.forEachAddedItem((record) => {
      //     console.log('1111 Added ', record.currentValue);
  
      //   });
      //   empArrayChanges.forEachRemovedItem((record) => {
      //     console.log('1111 Removed ' + record.previousValue);
      //   });
      // }
    }

    //Detect changes in object inside array
    // for (let [key, empDiffer] of this.objDiffers) {
    //   let empChanges = empDiffer.diff(this.differ.get(key));
    //   if (empChanges) {
    //     empChanges.forEachChangedItem(record => {
    //       console.log('--- Employee with id ' + key + ' updated ---');
    //       // this.changeLogs.push('--- Employee with id ' + key + ' updated ---');
    //       console.log('Previous value: ' + record.previousValue);
    //       // this.changeLogs.push('Previous value: ' + record.previousValue);
    //       console.log('Current value: ' + record.currentValue);
    //       // this.changeLogs.push('Current value: ' + record.currentValue);
    //     });
    //   }
    // }
    
  }


}
