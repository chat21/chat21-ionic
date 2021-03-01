import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { AvatarProfileComponent } from 'src/app/components/utils/avatar-profile/avatar-profile.component';
import { DdpHeaderComponent } from 'src/app/components/ddp-header/ddp-header.component';
import { UserPresenceComponent } from 'src/app/components/utils/user-presence/user-presence.component';
import { UserTypingComponent } from 'src/chat21-core/utils/user-typing/user-typing.component';


@NgModule({
  declarations: [
    AvatarProfileComponent,
    DdpHeaderComponent,
    UserPresenceComponent,
    UserTypingComponent
  ],
  exports: [
    AvatarProfileComponent,
    DdpHeaderComponent,
    UserPresenceComponent,
    UserTypingComponent
  ],
  imports: [
    CommonModule,
    IonicModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ]
})
export class SharedModule { }
