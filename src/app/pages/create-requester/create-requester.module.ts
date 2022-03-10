import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule ,ReactiveFormsModule} from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CreateRequesterPageRoutingModule } from './create-requester-routing.module';
import { CreateRequesterPage } from './create-requester.page';
import { TranslateLoader, TranslateModule} from '@ngx-translate/core';
import { createTranslateLoader } from '../../../chat21-core/utils/utils';
import { HttpClient } from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CreateRequesterPageRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    })
  ],
  declarations: [CreateRequesterPage]
})
export class CreateRequesterPageModule {}
