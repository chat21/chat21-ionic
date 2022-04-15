import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateRequesterPage } from './create-requester.page';

const routes: Routes = [
  {
    path: '',
    component: CreateRequesterPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateRequesterPageRoutingModule {}
