import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
// import { ConversationListPage } from './pages/conversations-list/conversations-list.page';
// import { ConversationDetailPage } from './pages/conversation-detail/conversation-detail.page';
// import { DetailsPage } from './pages/details/details.page';


const routes: Routes = [

  { path: '', redirectTo: 'conversation-detail', pathMatch: 'full' },
  {
    path: 'conversations-list',
    loadChildren: './pages/conversations-list/conversations-list.module#ConversationListPageModule'
    // loadChildren: () => import('./pages/conversations-list/conversations-list.module').then( m => m.ConversationListPageModule)
  },
  { path: 'conversation-detail/:IDConv',
    loadChildren: './pages/conversation-detail/conversation-detail.module#ConversationDetailPageModule'
  },
  { path: 'conversation-detail/:IDConv/:FullNameConv',
    loadChildren: './pages/conversation-detail/conversation-detail.module#ConversationDetailPageModule'
  },
  {
    path: 'conversation-detail',
    loadChildren: './pages/conversation-detail/conversation-detail.module#ConversationDetailPageModule'
    // loadChildren: () => import('./pages/conversation-detail/conversation-detail.module').then( m => m.ConversationDetailPageModule)
  },

  // {
  //   path: 'conversation-detail/:IDConv',
  //   loadChildren: () => import('./pages/conversation-detail/conversation-detail.module').then( m => m.ConversationDetailPageModule)
  // },
  // {
  //   path: 'detail/:IDConv',
  //   loadChildren: () => import('./pages/details/details.module').then( m => m.DetailsPageModule),
  //   // loadChildren: './pages/details/details.module',
  // },
  // {
  //   path: 'detail/:IDConv/:FullNameConv',
  //   loadChildren: () => import('./pages/details/details.module').then( m => m.DetailsPageModule),
  //   // loadChildren: './pages/details/details.module',
  // },
  // {
  //   path: 'detail',
  //   loadChildren: './pages/details/details.module#DetailsPageModule'
  //   // loadChildren: () => import('./pages/details/details.module').then( m => m.DetailsPageModule),
  //   // loadChildren: './pages/details/details.module',
  // },
  {
    path: 'contacts-directory',
    loadChildren: () => import('./pages/contacts-directory/contacts-directory.module').then( m => m.ContactsDirectoryPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/authentication/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'profile-info',
    loadChildren: () => import('./pages/profile-info/profile-info.module').then( m => m.ProfileInfoPageModule)
  },
  {
    path: 'loader-preview',
    loadChildren: () => import('./pages/loader-preview/loader-preview.module').then( m => m.LoaderPreviewPageModule)
  },


  // {
  //   path: 'home-info',
  //   loadChildren: () => import('./pages/home-info/home-info.module').then( m => m.HomeInfoPageModule)
  // }
];



@NgModule({
  imports: [
    RouterModule.forRoot(routes, { useHash: true, preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
