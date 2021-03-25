import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConversationsArchivedListPage } from './conversations-archived-list.page';

const routes: Routes = [
  {
    path: '',
    component: ConversationsArchivedListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConversationsArchivedListPageRoutingModule {}
