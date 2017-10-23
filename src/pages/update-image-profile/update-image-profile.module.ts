import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UpdateImageProfilePage } from './update-image-profile';

@NgModule({
  declarations: [
    UpdateImageProfilePage,
  ],
  imports: [
    IonicPageModule.forChild(UpdateImageProfilePage),
  ],
  exports: [
    UpdateImageProfilePage
  ]
})
export class UpdateImageProfilePageModule {}
