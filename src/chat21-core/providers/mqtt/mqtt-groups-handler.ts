import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { GroupModel } from 'src/chat21-core/models/group';
import { GroupsHandlerService } from 'src/chat21-core/providers/abstract/groups-handler.service';
import { CustomLogger } from '../logger/customLogger';
import { Chat21Service } from './chat-service';
import { LoggerInstance } from '../logger/loggerInstance';
@Injectable({
    providedIn: 'root'
  })
  export class MQTTGroupsHandler extends GroupsHandlerService {
    
    // BehaviorSubject
    BSgroupDetail: BehaviorSubject<GroupModel>;
    SgroupDetail: Subject<GroupModel>;
    groupAdded: BehaviorSubject<GroupModel>;
    groupChanged: BehaviorSubject<GroupModel>;
    groupRemoved: BehaviorSubject<GroupModel>;

    // private params
    private tenant: string;
    private loggedUserId: string;
    private logger: LoggerService = LoggerInstance.getInstance()
    
    constructor(
        public chat21Service: Chat21Service
    ) {
        super();
    }

    /**
     * inizializzo groups handler
     */
    initialize(tenant: string, loggedUserId: string): void {
        this.logger.printLog('initialize GROUP-HANDLER MQTT');
        this.tenant = tenant;
        this.loggedUserId = loggedUserId;

    }

    /**
     * mi connetto al nodo groups
     * creo la reference
     * mi sottoscrivo a change, removed, added
     */
    connect(): void {
//        throw new Error('Method not implemented.');
// Ignorare connect di firebase
         console.log('Method not implemented.');
    }

    /**
     * mi connetto al nodo groups/GROUPID
     * creo la reference
     * mi sottoscrivo a value
     */
    getDetail(groupId: string, callback?: (group: GroupModel) => void): Promise<GroupModel> {
        //throw new Error('Method not implemented.');
        // Ignorare versione firebase
          console.log('Method not implemented.');
          return;
    }

    onGroupChange(groupId: string): Observable<GroupModel> {
        // QUI TODO
        return this.SgroupDetail
    }

    create(groupName: string, members: [string], callback?: (res: any, error: any) => void): Promise<any> {
        // throw new Error('Method not implemented.');
        // Ignorare versione firebase
        console.log('Method not implemented.');
        return;
    }

    // create(groupName: string, members: [string], callback?:(res: any, error: any)=>void): Promise<any> {

    // }

    leave(groupId: string, callback?: (res: any, error: any) => void): Promise<any> {
        // throw new Error('Method not implemented.');
        // Ignorare versione firebase
        console.log('Method not implemented.');
        return;
    }

    join(groupId: string, member: string, callback?: (res: any, error: any) => void) {
        // throw new Error('Method not implemented.');
        // Ignorare versione firebase
        console.log('Method not implemented.');
        return;
    }


    dispose(): void {
        //throw new Error('Method not implemented.');
        console.log('Method not implemented.');
    }
      
  }
