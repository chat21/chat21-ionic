
import { Injectable } from '@angular/core';
export const CONTACTS_URL = 'https://tiledesk-server-pre.herokuapp.com/chat21/contacts';

@Injectable({
  providedIn: 'root'
})

export abstract class ContactsDirectoryService {

  abstract loadContactsFromUrl(remoteContactsUrl: string, token: string);
}
