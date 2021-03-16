import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export abstract class LoggerService {

  constructor() { }

  abstract printLog(...message: any[])
}
