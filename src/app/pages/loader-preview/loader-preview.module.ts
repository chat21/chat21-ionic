import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LoaderPreviewPageRoutingModule } from './loader-preview-routing.module';
import { LoaderPreviewPage } from './loader-preview.page';
import { TranslateLoader, TranslateModule} from '@ngx-translate/core';
import { createTranslateLoader } from '../../../chat21-core/utils/utils';
import { HttpClient } from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoaderPreviewPageRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    })
  ],
  declarations: [LoaderPreviewPage]
})
export class LoaderPreviewPageModule {}
