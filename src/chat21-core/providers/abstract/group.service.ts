import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AppConfigProvider } from 'src/app/services/app-config';
import { GroupModel } from 'src/chat21-core/models/group';
import { UserModel } from 'src/chat21-core/models/user';

@Injectable({
  providedIn: 'root'
})
export abstract class GroupService {

  // BehaviorSubject
  abstract BSgroupDetail: BehaviorSubject<GroupModel> = new BehaviorSubject<GroupModel>(null);
  abstract groupAdded: BehaviorSubject<GroupModel> = new BehaviorSubject<GroupModel>(null);
  abstract groupChanged: BehaviorSubject<GroupModel> = new BehaviorSubject<GroupModel>(null);
  abstract groupRemoved: BehaviorSubject<GroupModel> = new BehaviorSubject<GroupModel>(null);

  abstract initialize(tenant: string, loggedUserId: string): void;
  abstract connect(): void;
  abstract getDetail(groupId: string, callback?:(group: GroupModel)=>void): Promise<GroupModel>;
  abstract leave(groupId: string, callback?:()=>void): Promise<any>;
  abstract create(groupId: string, callback?:()=>void): Promise<any>;
}
