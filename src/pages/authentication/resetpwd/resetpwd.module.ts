import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ResetpwdPage } from './resetpwd';

@NgModule({
  declarations: [
    ResetpwdPage,
  ],
  imports: [
    IonicPageModule.forChild(ResetpwdPage),
  ],
  exports: [
    ResetpwdPage
  ]
})
export class ResetpwdModule {}
