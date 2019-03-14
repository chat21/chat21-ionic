import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PopoverProfilePage } from './popover-profile';

@NgModule({
  declarations: [
    PopoverProfilePage,
  ],
  imports: [
    IonicPageModule.forChild(PopoverProfilePage),
  ],
  exports: [
    PopoverProfilePage
  ]
})
export class PopoverProfilePageModule {}
