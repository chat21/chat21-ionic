import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { TranslateLoader, TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { createTranslateLoader } from '../../../chat21-core/utils/utils';

import { ConversationListPageRoutingModule } from './conversations-list-routing.module';
import { ConversationListPage } from './conversations-list.page';
// import { ConversationDetailPage } from '../conversation-detail/conversation-detail.page';
// import {LoginModalModule} from '../../modals/authentication/login/login.module';

// import { DdpHeaderComponent } from '../../components/ddp-header/ddp-header.component';
import { ContactsDirectoryPageModule } from '../contacts-directory/contacts-directory.module';
import { ProfileInfoPageModule } from '../profile-info/profile-info.module';
// import { ConversationDetailPageModule } from '../conversation-detail/conversation-detail.module';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConversationListPageRoutingModule,
    // ConversationDetailPageModule,
    ContactsDirectoryPageModule,
    ProfileInfoPageModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    SharedModule
  ],
  // entryComponents: [DdpHeaderComponent],
  declarations: [ConversationListPage]
})
export class ConversationListPageModule { }
