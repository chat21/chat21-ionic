import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule ,ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateCannedResponsePageRoutingModule } from './create-canned-response-routing.module';

import { CreateCannedResponsePage } from './create-canned-response.page';
import { TranslateLoader, TranslateModule} from '@ngx-translate/core';
import { createTranslateLoader } from '../../../chat21-core/utils/utils';
import { HttpClient } from '@angular/common/http';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CreateCannedResponsePageRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    })
  ],
  declarations: [CreateCannedResponsePage]
})
export class CreateCannedResponsePageModule {}
