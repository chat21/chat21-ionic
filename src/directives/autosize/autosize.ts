import {ElementRef, HostListener, Directive, OnInit} from '@angular/core';
import { MAX_HEIGHT_TEXTAREA, MIN_HEIGHT_TEXTAREA } from '../../utils/constants';

/**
 * Generated class for the AutosizeDirective directive.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/DirectiveMetadata-class.html
 * for more info on Angular Directives.
 */

@Directive({
  selector: 'ion-textarea[autosize]'
})

export class AutosizeDirective implements OnInit {
  // @HostListener('blur',['$event.target']) 
  // onBlur(textArea:HTMLTextAreaElement){
  //   //console.log('blur XXXXXXXXXXXXXXXXX');
  //   textArea = this.element.nativeElement.getElementsByTagName('textarea')[0];
  //   console.log('************ blur VALUE **************', textArea);
  //   // if ( textArea.value ){
  //   //   this.reset();
  //   // } 
  // }
  @HostListener('input', ['$event','$event.rangeParent','$event.target','$event.data', '$event.inputType'] )
  onInput(event, rangeParent, textArea:HTMLTextAreaElement, data:string, inputType:string):void { //textArea:HTMLTextAreaElement
    //let messageString = textArea.attributes.getNamedItem('ng-reflect-model').value.trim();
    let messageString = this.element.nativeElement.getElementsByTagName('textarea')[0].value;
    // console.log('************ $messageString2', messageString.trim());
    if(messageString == ''){
      this.element.nativeElement.getElementsByTagName('textarea')[0].value = '';
      //textArea.attributes.getNamedItem('ng-reflect-model').value = '';
      // console.log('************ messageString ----->',this.element.nativeElement.getElementsByTagName('textarea')[0].value,'<-----');
      return;
    }    
    if (event.inputType == "insertLineBreak" && messageString == null){
      // console.log('************ insertLineBreak');
      return;
    }
    // se messageString contiene \n non dimensiono!!!
    var match = /\r|\n/.exec(messageString);
    if (!match) {
      this.adjust();
    }
    
  }
  
  constructor(public element:ElementRef) {
  }

  ngOnInit():void {
    setTimeout(() => this.adjust(), 0);
  }

  adjust():void {
    let textArea = this.element.nativeElement.getElementsByTagName('textarea')[0];
    textArea.style.overflow = 'hidden';
    textArea.style.height = 'auto';  
    // console.log('************ adjust **************', textArea.value);
    if (textArea.scrollHeight <=  MIN_HEIGHT_TEXTAREA ){
      // console.log('************ OK H **************');
      return;
    }
    else if (textArea.scrollHeight <=  MAX_HEIGHT_TEXTAREA){
      // console.log('************ SET NW H **************');
      textArea.style.height = textArea.scrollHeight + "px";
    }
    else {
      // console.log('************ SET H MAX **************');
      textArea.style.height = MAX_HEIGHT_TEXTAREA + "px";
    }
  }

  reset():void{
    //console.log('************ SET H MIN **************');
    let textArea = this.element.nativeElement.getElementsByTagName('textarea')[0];
    // console.log('************ SET H MIN **************', textArea.value);
    textArea.value = "";
    textArea.style.height = MIN_HEIGHT_TEXTAREA + "px";
  }

}
