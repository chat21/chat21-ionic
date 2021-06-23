import { LogLevel } from './../../utils/constants';
import { Inject, Injectable } from '@angular/core';
import { NgxLinkifyjsModule } from 'ngx-linkifyjs';
import { NGXLogger, NGXLoggerMonitor, NGXLogInterface } from 'ngx-logger';
import { LoggerService } from './../abstract/logger.service';
@Injectable()
export class CustomLogger implements LoggerService {


    //private variables
    // private logger: NGXLogger 
    private logLevel: number = LogLevel.All

    constructor(@Inject('isLogEnabled') private isLogEnabled: boolean, private logger: NGXLogger) {
    }

    setLoglevel(logLevel: number){
        this.logLevel = logLevel;
    }

    printLog(...message: any[]) {
        if (this.isLogEnabled && this.logLevel >= LogLevel.All) {
            this.logger.log(message)
            // console.log(message)
        }
    }
    printDebug(...message: any[]) {
        if (this.isLogEnabled && this.logLevel >= LogLevel.Debug) {
            this.logger.debug(message)
            // console.log(message)
        }
    }
    printWarn(...message: any[]) {
        if (this.isLogEnabled && this.logLevel >= LogLevel.Warn) {
            this.logger.warn(message)
            // console.log(message)
        }
    }
    printInfo(...message: any[]) {
        if (this.isLogEnabled && this.logLevel >= LogLevel.Info) {
            this.logger.info(message)
            // console.log(message)
        }
    }
    printError(...message: any[]) {
        if (this.isLogEnabled && this.logLevel <= LogLevel.Error) {
            this.logger.error(message)
            // console.log(message)
        }
    }

}