import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CreateTicketPageRoutingModule } from './create-ticket-routing.module';
import { CreateTicketPage } from './create-ticket.page';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateLoader, TranslateModule} from '@ngx-translate/core';
import { createTranslateLoader } from '../../../chat21-core/utils/utils';
import { HttpClient } from '@angular/common/http';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreateTicketPageRoutingModule,
    NgSelectModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    })
  ],
  declarations: [CreateTicketPage]
})
export class CreateTicketPageModule {}
