import { Injectable } from '@angular/core';
import { Nav } from 'ionic-angular';
import { PlaceholderPage } from '../pages/placeholder/placeholder';
import { _DetailPage } from '../pages/_DetailPage';


//https://medium.com/@blewpri/master-detail-with-ionic-3-split-panes-866293608d47
@Injectable()
export class NavProxyService {

    _masterNav: Nav = null;

    get masterNav(): Nav {
        return this._masterNav;
    }
    set masterNav(value: Nav) {
        this._masterNav = value;
    }

    _detailNav: Nav = null;
    get detailNav(): Nav {
        return this._detailNav;
    }
    set detailNav(value: Nav) {
        this._detailNav = value;
    }

    _isOn: boolean = false;

    get isOn(): boolean {
        return this._isOn;
    }
    set isOn(value: boolean) {
        this._isOn = value;
    }



    pushDetail(page: any, params: any) {
        console.log("pushDetail",this.isOn);
        (this.isOn) ?
            this.detailNav.setRoot(page, params):
            //this.detailNav.push(page, params);
            this.masterNav.push(page, params);
    }

    pushMaster(page: any, params: any) {
        this.masterNav.push(page, params);
    }

    setRootMaster(page: any, params: any) {
        this.masterNav.setRoot(page, params);
    }

    /**
     * ATTENZIONE NN SO A COSA SERVE!!!
     * DA VERIFICARE
     * su firefox nn scompare il placeholder screen
     * lo forzo a true!!!!
     * @param isOn 
     */
    onSplitPaneChanged(isOn) {
        //isOn = true;
        console.log("-----------> onSplitPaneChanged <----------",this.isOn);
        // set local 'isOn' flag...
        this.isOn = isOn;
        // if the nav controllers have been instantiated...
        if (this.masterNav && this.detailNav) {
            (isOn) ? this.activateSplitView() :
                     this.deactivateSplitView();
        }
    }
    activateSplitView() {
        let currentView = this.masterNav.getActive();
            if (currentView.component.prototype
                instanceof _DetailPage) {
                // if the current view is a 'Detail' page...
                // - remove it from the 'master' nav stack...
                this.masterNav.pop();
                // - and add it to the 'detail' nav stack...
                this.detailNav.setRoot(
                    currentView.component,
                    currentView.data);
            }
     }
    deactivateSplitView() {
        let detailView = this.detailNav.getActive();
        this.detailNav.setRoot(PlaceholderPage);
        if (detailView.component.prototype instanceof _DetailPage) {
            // if the current detail view is a 'Detail' page...
            // ...so, not the placeholder page:
            let index = this.masterNav.getViews().length;
            // add it to the master view...
            this.masterNav.insert(index,
                detailView.component,
                detailView.data);
        }
    }
}
