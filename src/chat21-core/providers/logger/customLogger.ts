import { Inject, Injectable } from '@angular/core';
import { NgxLinkifyjsModule } from 'ngx-linkifyjs';
import { NGXLogger, NGXLoggerMonitor, NGXLogInterface } from 'ngx-logger';
import { LoggerService } from './../abstract/logger.service';
@Injectable()
export class CustomLogger implements LoggerService {


    //private variables
    // private logger: NGXLogger 

    // constructor(@Inject('isLogEnabled') private isLogEnabled: boolean, private logger: NGXLogger  ) {
    constructor(@Inject('isLogEnabled') private isLogEnabled: boolean) {
    }

    printLog(...message: any[]) {
        if (this.isLogEnabled && message && message.length > 0) {
            // this.logger.log(message)
            console.log(message)
        }
    }
    printDebug(...message: any[]) {
        if (this.isLogEnabled && message && message.length > 0) {
            // this.logger.debug(message)
            console.log(message)
        }
    }
    printError(...message: any[]) {
        if (this.isLogEnabled && message && message.length > 0) {
            // this.logger.error(message)
            console.log(message)
        }
    }

}