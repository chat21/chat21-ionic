import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { NavProxyService } from '../../services/nav-proxy.service';
import { ContactsService } from 'src/app/services/contacts/contacts.service';
// import { ContactsDirectoryService, CONTACTS_URL } from '../../services/contacts-directory.service';
import { UserModel } from 'src/app/models/user';
import { EventsService } from '../../services/events-service';


@Component({
  selector: 'app-contacts-directory',
  templateUrl: './contacts-directory.page.html',
  styleUrls: ['./contacts-directory.page.scss'],
})
export class ContactsDirectoryPage implements OnInit {
  @Input() token: string;
  // @Input() user: string;

  public contacts: Array<UserModel>;

  constructor(
    private modalController: ModalController,
    private navService: NavProxyService,
    // private contactsDirectoryService: ContactsDirectoryService,
    private contactsService: ContactsService,
    public events: EventsService
  ) {
  }

  ngOnInit() {
    console.log('TOKEN', this.token);
    this.initialize();
  }

  /** */
  initialize() {
    console.log('initialize');
    console.log('this.contactsDirectoryService  token: ', this.token);
    this.contacts = [];
    this.contactsService.loadContactsFromUrl(this.token);
    // this.contactsDirectoryService.loadContactsFromUrl(url, token).subscribe((response) => {
    //   console.log('ContactsDirectoryPage ------------->', response);
    //   this.setContacts(response);
    // });
  }

  /** */
  setContacts(data: any) {
    this.contacts = [];
    const listOfContacts = JSON.parse(JSON.stringify(data));
    listOfContacts.forEach((user: UserModel) => {
      let fullname = '';
      if (user.firstname && user.firstname !== undefined) {
          fullname += user.firstname;
      }
      if (user.lastname && user.lastname !== undefined) {
          fullname += ' ' + user.lastname;
      }
      user.fullname = fullname;
      this.contacts.push(user);
    });
  }

  /** */
  getTokenFromLocalStorage() {
    let token = localStorage.getItem('tiledeskToken');
    console.log('getTokenFromLocalStorage: ');

    // let token = "JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YWIwZjNmYTU3MDY2ZTAwMTRiZmQ3MWUiLCJlbWFpbCI6ImRhcmlvZGVwYTc1QGdtYWlsLmNvbSIsImZpcnN0bmFtZSI6IkRhcmlvIiwibGFzdG5hbWUiOiJEZSBQYXNjYWxpcyIsImlhdCI6MTYwMTg3ODUwOSwiYXVkIjoiaHR0cHM6Ly90aWxlZGVzay5jb20iLCJpc3MiOiJodHRwczovL3RpbGVkZXNrLmNvbSIsInN1YiI6InVzZXIiLCJqdGkiOiI1NWU2YzQ3MC0wZmVlLTQ5ZDktYmFlZi0wZjNkYmUwMDgyZjUifQ.ltUurOpBiokkpcnckfc1hA2Z_O_VuDoCpQrS5T8U10k";
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      console.log('user: ', user);
      if (user.token) {
        token = user.token;
        console.log('token: ', user.token);
      }
    }
    return token;
}

  /** */
  async onClose() {
    const isModalOpened = await this.modalController.getTop();
    if (isModalOpened) {
      this.modalController.dismiss({ confirmed: true });
    } else {
      this.navService.pop();
    }
  }

  /**
   *
   * @param user
   */
  openNewChat(user: UserModel) {
    console.log('openNewChat', user);
    this.events.publish('uidConvSelected:changed', user, 'new');
    this.onClose();
  }

}
