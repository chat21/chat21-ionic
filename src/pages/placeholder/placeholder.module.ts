import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PlaceholderPage } from './placeholder';

@NgModule({
    declarations: [
        PlaceholderPage,
    ],
    imports: [
        IonicPageModule.forChild(PlaceholderPage),
    ],
    exports: [
        PlaceholderPage
    ]
})
export class PlaceholderPageModule { }
