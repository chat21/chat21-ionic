import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ListaConversazioniPage } from './lista-conversazioni';

@NgModule({
  declarations: [
    ListaConversazioniPage,
  ],
  imports: [
    IonicPageModule.forChild(ListaConversazioniPage),
  ],
  exports: [
    ListaConversazioniPage
  ]
})
export class ListaConversazioniPageModule {}
