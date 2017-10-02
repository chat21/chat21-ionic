import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DettaglioConversazionePage } from './dettaglio-conversazione';

@NgModule({
  declarations: [
    DettaglioConversazionePage,
  ],
  imports: [
    IonicPageModule.forChild(DettaglioConversazionePage),
  ],
  exports: [
    DettaglioConversazionePage
  ]
})
export class DettaglioConversazionePageModule {}
