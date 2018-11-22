import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InfoUserPage } from './info-user';

@NgModule({
  declarations: [
    InfoUserPage,
  ],
  imports: [
    IonicPageModule.forChild(InfoUserPage),
  ],
})
export class InfoUserPageModule {}
