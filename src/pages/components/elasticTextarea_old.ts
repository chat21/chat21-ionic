import {Component, ViewChild} from '@angular/core';

@Component({
  selector: 'elastic-textarea',
  inputs: ['placeholder', 'lineHeight'],
  template:
  ` <ion-textarea #ionTxtArea
    placeholder='{{placeholder}}'
    [(ngModel)]="content"
    (ngModelChange)='onChange($event)'></ion-textarea>
  `,
  queries: {
    ionTxtArea: new ViewChild('ionTxtArea')
  }
})
export class ElasticTextarea {
    content
    lineHeight
    txtArea
    ionTxtArea
    
  constructor() {
    this.content = "";
    this.lineHeight = "22px";
  }

  ngAfterViewInit(){
    this.txtArea = this.ionTxtArea._elementRef.nativeElement.children[0];
    this.txtArea.style.height = this.lineHeight + "px";
    this.txtArea.style.resize = 'none';
  }

  onChange(newValue){
    this.txtArea.style.height = this.lineHeight + "px";
    this.txtArea.style.height =  this.txtArea.scrollHeight + "px";
  }

  clearInput(){
    this.content = "";
    this.txtArea.style.height = this.lineHeight + "px";
  }

  setFocus(){
    this.ionTxtArea.setFocus()
  }
}