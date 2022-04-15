import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateCannedResponsePage } from './create-canned-response.page';

const routes: Routes = [
  {
    path: '',
    component: CreateCannedResponsePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateCannedResponsePageRoutingModule {}
