import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ContactsDirectoryPage } from './contacts-directory.page';

const routes: Routes = [
  {
    path: '',
    component: ContactsDirectoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContactsDirectoryPageRoutingModule {}
