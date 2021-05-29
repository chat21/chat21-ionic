import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { TranslateLoader, TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';

import { createTranslateLoader } from '../../../chat21-core/utils/utils';

// import { AvatarComponent } from 'src/app/components/utils/avatar/avatar.component';
// import { AvatarModule } from 'src/app/components/utils/avatar/avatar.module';
import { SharedModule } from 'src/app/shared/shared.module';

import { ProfileInfoPageRoutingModule } from './profile-info-routing.module';
import { ProfileInfoPage } from './profile-info.page';
import { TooltipModule } from 'ng2-tooltip-directive';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfileInfoPageRoutingModule,
    TooltipModule,
    // AvatarModule,
    SharedModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    })
  ],
  declarations: [
    ProfileInfoPage
  ]

})
export class ProfileInfoPageModule {}
