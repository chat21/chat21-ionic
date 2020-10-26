import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

// import { InfoContentComponent } from 'src/app/components/conversation-info/info-content/info-content.component';
// import { InfoSupportGroupComponent } from 'src/app/components/conversation-info/info-support-group/info-support-group.component';
// import { InfoDirectComponent } from 'src/app/components/conversation-info/info-direct/info-direct.component';
// import { InfoGroupComponent } from 'src/app/components/conversation-info/info-group/info-group.component';


@NgModule({
  declarations: [
    // InfoContentComponent,
    // InfoSupportGroupComponent,
    // InfoDirectComponent,
    // InfoGroupComponent
  ],
  exports: [
    // InfoContentComponent,
    // InfoSupportGroupComponent,
    // InfoDirectComponent,
    // InfoGroupComponent
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
export class SharedConversationInfoModule { }
