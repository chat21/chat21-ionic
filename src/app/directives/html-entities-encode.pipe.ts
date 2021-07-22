import { Pipe, PipeTransform } from '@angular/core';
import { htmlEntities, replaceEndOfLine } from 'src/chat21-core/utils/utils';

@Pipe({
  name: 'htmlEntiesEncode'
})

export class HtmlEntitiesEncodePipe implements PipeTransform {

  transform(text: any, args?: any): any { 
    text = htmlEntities(text);
    text = replaceEndOfLine(text);
    text = text.trim();
    return text;
  }

}
