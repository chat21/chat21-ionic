import { Component } from '@angular/core';
import {
    IonicPage,
    NavController,
    NavParams 
} from 'ionic-angular';

@IonicPage()
@Component({
    selector: 'page-placeholder',
    templateUrl: 'placeholder.html',
})
export class PlaceholderPage {
    constructor(
        public navCtrl: NavController, 
        public navParams: NavParams
    ) { }
}
