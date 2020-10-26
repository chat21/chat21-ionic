import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConversationListPage } from './conversations-list.page';

const routes: Routes = [
  {
    path: '',
    component: ConversationListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConversationListPageRoutingModule {}
