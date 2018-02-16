import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InfoConversationPage } from './info-conversation';
//import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    InfoConversationPage,
  ],
  imports: [
    IonicPageModule.forChild(InfoConversationPage),
    // TranslateModule.forChild()
  ],
})
export class InfoConversationPageModule {}
