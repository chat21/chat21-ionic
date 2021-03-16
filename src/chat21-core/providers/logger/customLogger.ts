import { Inject, Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { LoggerService } from './../abstract/logger.service';
@Injectable()
export class CustomLogger extends LoggerService{
    
    private isLogEnabled: boolean = true;
    constructor(private logger: NGXLogger) {
        super();
    }

    printLog(...message: any[]) {
        if(message && message.length > 0){
            this.logger.log(message)
        }
    }

}