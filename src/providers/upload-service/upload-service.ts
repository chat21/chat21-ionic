import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Config } from 'ionic-angular';

import * as firebase from 'firebase';
import { UploadModel } from '../../models/upload';


@Injectable()
/**
 * DESC PROVIDER
 */
export class UploadService {
  private tenant: string;
  private uidCurrentUser: string;

  constructor(
    //private af: AngularFire, 
    //private db: AngularFireDatabase
    public config: Config
  ) { 
    // recupero tenant
    let appConfig = this.config.get("appConfig");
    this.tenant = appConfig.tenant;
  }

  private createGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
       // tslint:disable-next-line:no-bitwise
       const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
       return v.toString(16);
    });
   }
   
  pushUploadMessage(upload: UploadModel): any {
    const uid = this.createGuid();
    const urlImagesNodeFirebase = '/public/images/' + uid + '/';
    console.log('pushUpload::::::::::::: ', urlImagesNodeFirebase);

    // Create a root reference
    const storageRef = firebase.storage().ref();

    // Create a reference to 'mountains.jpg'
    const mountainsRef = storageRef.child(urlImagesNodeFirebase);

    return mountainsRef.put(upload.file);
    // .then(function(snapshot) {
    //   console.log('Uploaded a blob or file! ', snapshot.downloadURL);
    //   this.observable.next(snapshot.downloadURL);
    // });
  }

  pushUpload(upload: UploadModel) {
    // recupero current user id
    this.uidCurrentUser = firebase.auth().currentUser.uid;
    const urlImagesNodeFirebase = '/apps/'+this.tenant+'/contacts/'+this.uidCurrentUser+"-imageProfile";
    var next = function(snapshot) {
      // upload in progress
      var snapshotRef = snapshot as firebase.storage.UploadTaskSnapshot;
      var percent = snapshotRef.bytesTransferred / snapshotRef.totalBytes * 100;
      console.log("snapshot::::::::::::: ",percent);
      upload.progress = percent;
    };
    var error = function(error) {
      // upload failed
      console.log(error);
    };
    var complete = function() {
      // upload success
      upload.url = uploadTask.snapshot.downloadURL;
      upload.name = upload.file.name;
      upload.progress = 100;
    };
    let storageRef = firebase.storage().ref();
    let uploadTask = storageRef.child(urlImagesNodeFirebase).put(upload.file);
    
    // This is equivalent to the first example.
    var subscribe = uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED);
    subscribe(next, error, complete);
  }

  display(uidContact) {
    if(uidContact && uidContact!=''){
      const urlImagesNodeFirebase = '/apps/'+this.tenant+'/contacts/'+uidContact+"-imageProfile";
      return firebase.storage().ref().child(urlImagesNodeFirebase).getDownloadURL()
    }
  }

}