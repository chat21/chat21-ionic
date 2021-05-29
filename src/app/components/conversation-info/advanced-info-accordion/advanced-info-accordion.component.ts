import { Component, OnInit, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-advanced-info-accordion',
  templateUrl: './advanced-info-accordion.component.html',
  styleUrls: ['./advanced-info-accordion.component.scss'],
})
export class AdvancedInfoAccordionComponent implements OnInit, OnChanges {
  @Input() advancedAttributes: string;
  @Input() translationMap: Map<string, string>;
  public teammateID: string;

  tooltipOptions = {
    'show-delay': 100,
    'tooltip-class': 'chat-tooltip',
    'theme': 'light',
    'shadow': false,
    'hide-delay-mobile': 0,
    'hideDelayAfterClick': 3000,
    'hide-delay': 200
  };

  constructor() { }

  ngOnInit() { }

  openAdvancedInfoAccordion() {
    console.log('Has clicked  openAdvancedInfoAccordion')





    var acc = <HTMLElement>document.querySelector('#absolute-icon_' + this.teammateID)
    console.log('Has clicked  openAdvancedInfoAccordion absolute-icon', acc)
    acc.classList.toggle("active");
    var panel = <HTMLElement>document.querySelector('#advanced-info-panel_' + this.teammateID)
    console.log('Has clicked  openAdvancedInfoAccordion panel', panel)
    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
    }



    // var acc = <HTMLElement>document.querySelector('.absolute-icon')
    // console.log('Has clicked  openAdvancedInfoAccordion absolute-icon', acc)
    // acc.classList.toggle("active");
    // var panel = <HTMLElement>document.querySelector('.advanced-info-panel')
    // console.log('Has clicked  openAdvancedInfoAccordion panel', panel)
    // if (panel.style.maxHeight) {
    //   panel.style.maxHeight = null;
    // } else {
    //   panel.style.maxHeight = panel.scrollHeight + "px";
    // }



  }

  ngOnChanges() {
    console.log('ADVANCED-INFO-ACCORDION  advancedAttributes ', this.advancedAttributes)
    this.teammateID = this.advancedAttributes[0]['value'];
    console.log('ADVANCED-INFO-ACCORDION  teammateID ', this.teammateID)
  }


}
