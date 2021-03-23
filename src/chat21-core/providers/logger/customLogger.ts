import { Inject, Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { LoggerService } from './../abstract/logger.service';
@Injectable()
export class CustomLogger extends LoggerService{
    
    
    //private variables
    //private logger: NGXLogger

    constructor(@Inject('isLogEnabled') private isLogEnabled: boolean, private logger: NGXLogger) {
        super();
    }

    printLog(...message: any[]) {
        if(this.isLogEnabled && message && message.length > 0){
            this.logger.log(message)
        }
    }
    printDebug(...message: any[]) {
        if(this.isLogEnabled && message && message.length > 0){
            this.logger.debug(message)
        }
    }
    printError(...message: any[]) {
        if(this.isLogEnabled && message && message.length > 0){
            this.logger.error(message)
        }
    }

}