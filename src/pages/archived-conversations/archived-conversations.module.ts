import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ArchivedConversationsPage } from './archived-conversations';

@NgModule({
  declarations: [
    ArchivedConversationsPage,
  ],
  imports: [
    IonicPageModule.forChild(ArchivedConversationsPage),
  ],
})
export class ArchivedConversationsPageModule {}
