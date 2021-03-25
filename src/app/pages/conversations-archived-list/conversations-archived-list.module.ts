import { SharedModule } from 'src/app/shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConversationsArchivedListPageRoutingModule } from './conversations-archived-list-routing.module';

import { ConversationsArchivedListPage } from './conversations-archived-list.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    ConversationsArchivedListPageRoutingModule,
    SharedModule
  ],
  declarations: [ConversationsArchivedListPage]
})
export class ConversationsArchivedListPageModule {}
