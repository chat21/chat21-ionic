import { Component, OnInit, Input, OnChanges } from '@angular/core';
// Logger
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';

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
  private logger: LoggerService = LoggerInstance.getInstance()
  
  constructor() { }

  ngOnInit() { }


  ngOnChanges() {
    this.logger.log('ADVANCED-INFO-ACCORDION  advancedAttributes ', this.advancedAttributes)
    this.teammateID = this.advancedAttributes[0]['value'];
    this.logger.log('ADVANCED-INFO-ACCORDION  teammateID ', this.teammateID)
  }

  openAdvancedInfoAccordion() {
    this.logger.log('Has clicked  openAdvancedInfoAccordion')

    var acc = <HTMLElement>document.querySelector('#absolute-icon_' + this.teammateID)
    this.logger.log('Has clicked  openAdvancedInfoAccordion absolute-icon', acc)
    acc.classList.toggle("active");
    var panel = <HTMLElement>document.querySelector('#advanced-info-panel_' + this.teammateID)
    this.logger.log('Has clicked  openAdvancedInfoAccordion panel', panel)
    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
    }
  }

}
