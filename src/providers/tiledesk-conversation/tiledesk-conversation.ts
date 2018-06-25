import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

// ====== [BEGIN chat21]
import { ChatManager } from '../../providers/chat-manager/chat-manager';
import { UserService } from '../../providers/user/user';
// ====== [END chat21]


@Injectable()
export class TiledeskConversationProvider {

  private BASE_URL: string;

  private appId : string;

  /**
   * Contains the status of the conversation closing.
   * 
   * When a new conversation is added from firebase, it will be added to the isConversationClosingMap with a false value.
   * 
   * When an existing conversation is removed from firebase, it will be removed from the isConversationClosingMap.
   * 
   * When an user clicks on a conversation to close it,
   * the conversation with conversationID will be set to true within the isConversationClosingMap.
   * 
   * If an error occurs the conversation with conversationID will be set to false.
   * 
   */
  private isConversationClosingMap: Map<string, boolean>; 

  constructor(
    public http: Http,
    private chatManager: ChatManager,
    private userService: UserService
  ) {
    this.init();
    this.isConversationClosingMap = new Map(); 
  }

  private init() {
    this.BASE_URL = "https://us-central1-chat-v2-dev.cloudfunctions.net";
    // console.log("TiledeskConversationProvider::init::BASE_URL::url", this.BASE_URL);

    // retrieve the appId from the chat21 sdk
    this.appId = this.chatManager.getTenant();
    // console.log("TiledeskConversationProvider::init::appId::url", this.appId);
  }

  // public test() : void {
  //   console.log("TiledeskConversationProvider::test::", "ALL OK!");
  // }


  // Service available at https://github.com/chat21/chat21-cloud-functions/blob/master/docs/api.md#delete-a-conversation
  // Syntax: 
  // curl  -X DELETE \
  //       -H 'Content-Type: application/json' \
  //       -H "Authorization: Bearer <FIREBASE_ID_TOKEN>" \
  //       https://us-central1-<FIREBASE_PROJECT_ID>.cloudfunctions.net/api/<APP_ID>/conversations/<RECIPIENT_ID>

  public deleteConversation(recipientId) {

    const token = this.userService.returnToken(); // retrieve the user auth token

    // create the header of the request
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', 'Bearer ' + token);

    // create the request url 
    const url = this.BASE_URL + '/api/' + this.appId + '/conversations/' + recipientId;
    // console.log("TiledeskConversationProvider::deleteConversation::url", url);

    // create the request options
    const options = new RequestOptions({ headers: headers });
    // console.log("TiledeskConversationProvider::deleteConversation::options", options);

    // make the call
    return this.http
      .delete(url, options)
     .map((response: Response) => response.json())
  }

  /**
   * Returns the status of the conversations with conversationId from isConversationClosingMap
   * 
   * @param conversationId the conversation id
   * @returns true if the conversation is waiting to be closed, false otherwise
   */
  public getClosingConversation(conversationId) {
    return this.isConversationClosingMap[conversationId];
  }

  /**
   * Add the conversation with conversationId to the isConversationClosingMap
   * 
   * @param conversationId the id of the conversation of which it wants to save the state
   * @param status true if the conversation is waiting to be closed, false otherwise
   */
  public setClosingConversation(conversationId, status) {
    this.isConversationClosingMap[conversationId] = status;
  }

  /**
   * Delete the conversation with conversationId from the isConversationClosingMap
   * 
   * @param conversationId the id of the conversation of which is wants to delete
   */
  public deleteClosingConversation(conversationId) {
    this.isConversationClosingMap.delete(conversationId);
  }

}
