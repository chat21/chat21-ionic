import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import * as firebase from 'firebase';

import { UploadModel } from '../../models/upload';
import { UploadService } from '../../providers/upload-service/upload-service';

import { contactsRef } from '../../utils/utils';
import { ChatManager } from '../../providers/chat-manager/chat-manager';

@IonicPage()
@Component({
  selector: 'page-update-image-profile',
  templateUrl: 'update-image-profile.html',
})
export class UpdateImageProfilePage {

  private event: any;
  private uidContact: string;
  private currentUpload: UploadModel;
  private image: any;
  //private imageurl: string;
  private selectedFiles: FileList;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private upSvc: UploadService,
    public zone: NgZone,
    public chatManager: ChatManager,
    //private events: Events
  ) {
    // recupero event
    this.event = navParams.get('event');
    this.uidContact = navParams.get('uidContact');
   
    // imposto immagine per anteprima
    if(this.event){
      this.selectedFiles = this.event.target.files;
      this.fileChange(event);
    }
    else{
      this.displayImage(this.uidContact);
    }

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UpdateImageProfilePage');
  }
  
  displayImage(uidContact){
    this.upSvc.display(uidContact, '')
    .then(onResolve, onReject)
    function onResolve(foundURL) { 
        console.log('foundURL', foundURL);
        this.image = foundURL; 
    } 
    function onReject(error){ 
        console.log('error.code', error.code); 
        this.image = 'assets/img/no_image.png';
    }

    // .then((url) => {
    //   this.zone.run(() => {
    //     this.image = url;
    //   });
    // })
    // .catch((error)=>{
    //   console.log("error::: ",error);
    // });
  }

  fileChange(event){
    if(event.target.files && event.target.files[0]){
      let reader = new FileReader();
      reader.onload = (event:any) => {
        this.image = event.target.result;
      }
      reader.readAsDataURL(event.target.files[0]);
    }
    //let fileList: FileList = event.target.files;  
    //let file: File = fileList[0];
  }

  uploadSingle() {
    const tenant = this.chatManager.getTenant();
    const uidContact = this.chatManager.getLoggedUser().uid;
    var send_order_btn = <HTMLInputElement>document.getElementById("start-upload");
    send_order_btn.disabled = true;
    let file = this.selectedFiles.item(0)
    this.currentUpload = new UploadModel(file);
    const uploadTask = this.upSvc.pushUploadImage(this.currentUpload)
    uploadTask.on('state_changed', function(snapshot){
      // Observe state change events such as progress, pause, and resume
      // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
      var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log('Upload is ' + progress + '% done');
      switch (snapshot.state) {
        case firebase.storage.TaskState.PAUSED: // or 'paused'
          console.log('Upload is paused');
          break;
        case firebase.storage.TaskState.RUNNING: // or 'running'
          console.log('Upload is running');
          break;
      }
    }, function(error) {
      // Handle unsuccessful uploads
    }, function() {
      // Handle successful uploads on complete
      // For instance, get the download URL: https://firebasestorage.googleapis.com/...
      var downloadURL = uploadTask.snapshot.downloadURL;
      const urlNodeConcacts = contactsRef(tenant) + uidContact + '/imageurl/';
      console.log('Uploaded a blob or file! ', urlNodeConcacts);
      firebase.database().ref(urlNodeConcacts).set(downloadURL);
    });
    // .then(function(snapshot) {
    //   const urlNodeConcacts = contactsRef(tenant) + uidContact + '/imageurl/';
    //   console.log('Uploaded a blob or file! ', urlNodeConcacts);
    //   firebase.database().ref(urlNodeConcacts).set(snapshot.downloadURL);
    // })
    // .catch(function(error) {
    //   // Handle Errors here.
    //   const errorCode = error.code;
    //   const errorMessage = error.message;
    //   console.log('error: ', errorCode, errorMessage);
    // });

    //this.upSvc.pushUpload(this.currentUpload)
  }

  goBack(){
    this.navCtrl.pop({animate: true, duration: 0.3});    
  }

}
