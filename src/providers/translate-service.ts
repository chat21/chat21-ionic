

import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

import { TranslateService } from '@ngx-translate/core';

@Injectable()
 
export class CustomTranslateService {

    public ARRAY_DAYS: string[];
    public LABEL_TO: string;
    public LABEL_LAST_ACCESS: string;
    public LABEL_TOMORROW: string;
    public LABEL_TODAY: string;
    //public translate: TranslateService;

    constructor(public translate: TranslateService) {
      // this language will be used as a fallback when a translation isn't found in the current language
      const language = document.documentElement.lang;
      console.log('language: ', language, this.translate);
      this.translate.use(language);
  
      this.translate.get('LABEL_TODAY').subscribe(
        value => {
          // value is our translated string
          this.LABEL_TODAY = value;
        }
      );
      this.translate.get('LABEL_TOMORROW').subscribe(
        value => {
          // value is our translated string
          this.LABEL_TOMORROW = value;
        }
      );
  
      this.translate.get('LABEL_LAST_ACCESS').subscribe(
        value => {
          // value is our translated string
          this.LABEL_LAST_ACCESS = value;
        }
      );
      this.translate.get('LABEL_TO').subscribe(
        value => {
          // value is our translated string
          this.LABEL_TO = value;
        }
      ),
      this.translate.get('ARRAY_DAYS').subscribe(
        value => {
          // value is our translated string
          this.ARRAY_DAYS = value;
        }
      )
  
    }

  }