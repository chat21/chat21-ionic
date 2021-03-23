import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export abstract class LoggerService {

  constructor() { }

  abstract printLog(...message: any[])
  abstract printDebug(...message: any[])
  abstract printError(...message: any[])
}
