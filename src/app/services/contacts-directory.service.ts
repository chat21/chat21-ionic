
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

export const CONTACTS_URL = environment.SERVER_BASE_URL + 'chat21/contacts';

@Injectable({
  providedIn: 'root'
})

export abstract class ContactsDirectoryService {

  abstract loadContactsFromUrl(remoteContactsUrl: string, token: string);
}
