import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ListaConversazioniPage } from './lista-conversazioni';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    ListaConversazioniPage,
  ],
  imports: [
    IonicPageModule.forChild(ListaConversazioniPage),
    TranslateModule.forChild()
  ],
  exports: [
    ListaConversazioniPage
  ]
})
export class ListaConversazioniPageModule {}
