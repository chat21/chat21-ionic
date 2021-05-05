import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-advanced-info-accordion',
  templateUrl: './advanced-info-accordion.component.html',
  styleUrls: ['./advanced-info-accordion.component.scss'],
})
export class AdvancedInfoAccordionComponent implements OnInit {
  @Input() advancedAttributes: string;
  @Input() translationMap: Map<string, string>;
  

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

  ngOnInit() {}

  openAdvancedInfoAccordion () {

    // var acc = document.getElementsByClassName("accordion");
    // var acc = <HTMLElement>document.querySelector('.advanced-info-accordion')
    // acc.classList.toggle("active");
    var acc = <HTMLElement>document.querySelector('.absolute-icon')
    acc.classList.toggle("active");
    var panel = <HTMLElement>document.querySelector('.advanced-info-panel')
    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
    }

 
    // var i;
    
    // for (i = 0; i < acc.length; i++) {
    //   acc[i].addEventListener("click", function() {
    //     this.classList.toggle("active");
    //     var panel = this.nextElementSibling;
    //     if (panel.style.maxHeight) {
    //       panel.style.maxHeight = null;
    //     } else {
    //       panel.style.maxHeight = panel.scrollHeight + "px";
    //     }
    //   });
    // }
  }


}
