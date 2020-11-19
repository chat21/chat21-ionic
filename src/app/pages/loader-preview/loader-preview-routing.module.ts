import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoaderPreviewPage } from './loader-preview.page';

const routes: Routes = [
  {
    path: '',
    component: LoaderPreviewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoaderPreviewPageRoutingModule {}
