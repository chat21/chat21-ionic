import { NgModule, Directive, ElementRef } from '@angular/core';
@Directive({
  selector: '[appScrollbarTheme]'
})
export class ScrollbarThemeDirective {
  constructor(el: ElementRef) {
    const stylesheet = `
      ::-webkit-scrollbar {
      width: 10px;
      }
      ::-webkit-scrollbar-track {
      background: #0f0f0f;
      }
      ::-webkit-scrollbar-thumb {
      border-radius: 1rem;
      background: linear-gradient(var(--ion-color-light-tint), var(--ion-color-light));
      border: 4px solid #020202;
      }
      ::-webkit-scrollbar-thumb:hover {
      }

      ::-webkit-scrollbar {
        width: 20px;
      }
  
      /* Track */
      ::-webkit-scrollbar-track {
        box-shadow: inset 0 0 5px grey; 
        border-radius: 10px;
      }
  
      /* Handle */
      ::-webkit-scrollbar-thumb {
        background: red; 
        border-radius: 10px;
      }
  
      /* Handle on hover */
      ::-webkit-scrollbar-thumb:hover {
        background: #b30000; 
      }
    `;

    setTimeout(() => {
      const styleElmt = el.nativeElement.shadowRoot.querySelector('style');
      if (styleElmt) {
        styleElmt.append(stylesheet);
      } else {
        const barStyle = document.createElement('style');
        barStyle.append(stylesheet);
        el.nativeElement.shadowRoot.appendChild(barStyle);
      }
    }, 2500);

  }
}


@NgModule({
  declarations: [ ScrollbarThemeDirective ],
  exports: [ ScrollbarThemeDirective ]
})
export class ScrollbarThemeModule {}