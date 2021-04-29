import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { GroupModel } from 'src/chat21-core/models/group';
import { GroupsHandlerService } from 'src/chat21-core/providers/abstract/groups-handler.service';
import { Chat21Service } from './chat-service';
@Injectable({
    providedIn: 'root'
  })
  export class MQTTGroupsHanlder extends GroupsHandlerService {
    
    // BehaviorSubject
    BSgroupDetail: BehaviorSubject<GroupModel>;
    SgroupDetail: Subject<GroupModel>;
    groupAdded: BehaviorSubject<GroupModel>;
    groupChanged: BehaviorSubject<GroupModel>;
    groupRemoved: BehaviorSubject<GroupModel>;

    constructor(
        public chat21Service: Chat21Service
    ) {
        super();
    }

    /**
     * inizializzo groups handler
     */
    initialize(tenant: string, loggedUserId: string): void {
       // throw new Error('Method not implemented.');
        console.log('Method not implemented.');
    }

    /**
     * mi connetto al nodo groups
     * creo la reference
     * mi sottoscrivo a change, removed, added
     */
    connect(): void {
//        throw new Error('Method not implemented.');
         console.log('Method not implemented.');
    }

    /**
     * mi connetto al nodo groups/GROUPID
     * creo la reference
     * mi sottoscrivo a value
     */
    getDetail(groupId: string, callback?: (group: GroupModel) => void): Promise<GroupModel> {
        //throw new Error('Method not implemented.');
          console.log('Method not implemented.');
    }
    onGroupChange(groupId: string): Observable<GroupModel> {
        //throw new Error('Method not implemented.');
        console.log('Method not implemented.');
    }
    leave(groupId: string, callback?: () => void): Promise<any> {
        //throw new Error('Method not implemented.');
        console.log('Method not implemented.');
    }
    create(groupId: string, callback?: () => void): Promise<any> {
        //throw new Error('Method not implemented.');
        console.log('Method not implemented.');
    }
    dispose(): void {
        //throw new Error('Method not implemented.');
        console.log('Method not implemented.');
    }
      
  }
