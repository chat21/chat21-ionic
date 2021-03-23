import { Component, IterableDiffers, KeyValueDiffers, OnInit } from '@angular/core';
import { ImageRepoService } from 'src/chat21-core/providers/abstract/image-repo.service';
import { convertMessage } from 'src/chat21-core/utils/utils';
import { ListConversationsComponent } from '../list-conversations/list-conversations.component';

@Component({
  selector: 'ion-list-conversations',
  templateUrl: './ion-list-conversations.component.html',
  styleUrls: ['./ion-list-conversations.component.scss'],
})
export class IonListConversationsComponent extends ListConversationsComponent implements OnInit {

  public convertMessage = convertMessage;
  
  constructor(public iterableDiffers: IterableDiffers,
              public imageRepoService: ImageRepoService) { 
                super(iterableDiffers, imageRepoService)}

  ngOnInit() {}


}
