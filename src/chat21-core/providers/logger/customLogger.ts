import { LogLevel } from './../../utils/constants';
import { Inject, Injectable } from '@angular/core';
import { NGXLogger, NGXLoggerMonitor, NGXLogInterface } from 'ngx-logger';
import { LoggerService } from './../abstract/logger.service';
@Injectable()
export class CustomLogger implements LoggerService {
    // Error = 0,
    // Warn = 1,
    // Info = 2,
    // Debug = 3

    //private variables
    // private logger: NGXLogger 
    private logLevel: number = LogLevel.Debug

    constructor(@Inject('isLogEnabled') private isLogEnabled: boolean, private logger: NGXLogger) {
    }

    setLoggerConfig(isLogEnabled: boolean, logLevel: number) {
        this.isLogEnabled = isLogEnabled;
        this.logLevel = logLevel;
        console.log('LoggerService this.logLevel  ', this.logLevel)

    }

    error(...message: any[]) {
        if (this.isLogEnabled && this.logLevel >= LogLevel.Error) {
            this.logger.error(message)
            // console.log(message)
        }
    }

    warn(...message: any[]) {
        if (this.isLogEnabled && this.logLevel >= LogLevel.Warn) {
            this.logger.warn(message)
            // console.log(message)
        }
    }

    info(...message: any[]) {
        if (this.isLogEnabled && this.logLevel >= LogLevel.Info) {
            this.logger.info(message)
            // console.log(message)
        }
    }

    debug(...message: any[]) {
        
        if (this.isLogEnabled && this.logLevel >= LogLevel.Debug) {
            this.logger.debug(message)
            // console.debug(message)
        }
    }

    log(...message: any[]) {
        if (this.isLogEnabled && this.logLevel >= LogLevel.Debug) {
            // console.log(message);
            this.logger.log(message)
        }
    }

}