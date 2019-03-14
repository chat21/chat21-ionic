import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DettaglioConversazionePage } from './dettaglio-conversazione';

import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    DettaglioConversazionePage,
  ],
  imports: [
    IonicPageModule.forChild(DettaglioConversazionePage),
    TranslateModule.forChild()
  ],
  exports: [
    DettaglioConversazionePage
  ]
})
export class DettaglioConversazionePageModule {}
