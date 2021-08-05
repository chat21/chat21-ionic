import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[autoFocus]'
})
export class AutofocusDirective {

  constructor(private host: ElementRef) {}

  ngAfterViewInit() {
    // console.log('AutofocusDirective') 
    this.host.nativeElement.focus();
  }
}
