import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';


@Component({
  selector: 'app-option-header',
  templateUrl: './option-header.component.html',
  styleUrls: ['./option-header.component.scss'],
})
export class OptionHeaderComponent implements OnInit {

  @Input() headerTitle: string
  @Output() onBackButton = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() {
    // console.log('headertitleeee', this.headerTitle)
  }

  onBackButtonHandler(){
    this.onBackButton.emit(true)
  }

}
