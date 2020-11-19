import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoaderPreviewPageRoutingModule } from './loader-preview-routing.module';

import { LoaderPreviewPage } from './loader-preview.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoaderPreviewPageRoutingModule
  ],
  declarations: [LoaderPreviewPage]
})
export class LoaderPreviewPageModule {}
