import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TranslateLoader, TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { createTranslateLoader } from '../../utils/utils';

import { IonicModule } from '@ionic/angular';
import { ConversationDetailPageRoutingModule } from './conversation-detail-routing.module';
import { ConversationDetailPage } from './conversation-detail.page';

// import { InfoSupportGroupComponent } from '../../components/conversation-info/info-support-group/info-support-group.component';
// import { InfoDirectComponent } from '../../components/conversation-info/info-direct/info-direct.component';
// import { InfoGroupComponent } from '../../components/conversation-info/info-group/info-group.component';

// tslint:disable-next-line: max-line-length
import { HeaderConversationDetailComponent } from '../../components/conversation-detail/header-conversation-detail/header-conversation-detail.component';
import { MessageTextAreaComponent } from '../../components/conversation-detail/message-text-area/message-text-area.component';
import { BubbleDayMessageComponent } from '../../components/conversation-detail/bubble-day-message/bubble-day-message.component';
import { BubbleSystemMessageComponent } from '../../components/conversation-detail/bubble-system-message/bubble-system-message.component';
import { BubbleMyMessageComponent } from '../../components/conversation-detail/bubble-my-message/bubble-my-message.component';
import { BubbleOthersMessageComponent } from '../../components/conversation-detail/bubble-others-message/bubble-others-message.component';
// import { InfoContentComponent } from '../../components/conversation-info/info-content/info-content.component';
// import { InfoDirectComponent } from '../../components/conversation-info/info-direct/info-direct.component';
import { InfoContentComponent } from 'src/app/components/conversation-info/info-content/info-content.component';
import { InfoSupportGroupComponent } from 'src/app/components/conversation-info/info-support-group/info-support-group.component';
import { InfoDirectComponent } from 'src/app/components/conversation-info/info-direct/info-direct.component';
import { InfoGroupComponent } from 'src/app/components/conversation-info/info-group/info-group.component';


import { SharedModule } from 'src/app/shared/shared.module';
// import { SharedConversationInfoModule } from 'src/app/shared/shared-conversation-info.module';
import { NgxLinkifyjsModule } from 'ngx-linkifyjs';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConversationDetailPageRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      },
    }),
    SharedModule,
    NgxLinkifyjsModule
  ],
  entryComponents: [MessageTextAreaComponent],
  declarations: [
    ConversationDetailPage,
    HeaderConversationDetailComponent,
    MessageTextAreaComponent,
    BubbleDayMessageComponent,
    BubbleSystemMessageComponent,
    BubbleMyMessageComponent,
    BubbleOthersMessageComponent,
    InfoContentComponent,
    InfoSupportGroupComponent,
    InfoDirectComponent,
    InfoGroupComponent
  ]
})
export class ConversationDetailPageModule {}
