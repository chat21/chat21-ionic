import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UnassignedConversationsPageRoutingModule } from './unassigned-conversations-routing.module';

import { UnassignedConversationsPage } from './unassigned-conversations.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UnassignedConversationsPageRoutingModule
  ],
  declarations: [
    UnassignedConversationsPage,
  ]
})
export class UnassignedConversationsPageModule {}
