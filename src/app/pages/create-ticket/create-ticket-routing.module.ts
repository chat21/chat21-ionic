import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateTicketPage } from './create-ticket.page';

const routes: Routes = [
  {
    path: '',
    component: CreateTicketPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateTicketPageRoutingModule {}
