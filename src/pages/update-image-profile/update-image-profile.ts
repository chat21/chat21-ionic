import { Component, NgZone } from '@angular/core';
import { Config, IonicPage, NavController, NavParams } from 'ionic-angular';
import { UploadModel } from '../../models/upload';
import { UploadService } from '../../providers/upload-service/upload-service';


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
    public zone: NgZone
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
    this.upSvc.display(uidContact)
    .then((url) => {
      this.zone.run(() => {
        this.image = url;
      });
    })
    .catch((error)=>{
      console.log("error::: ",error);
    });
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
    var send_order_btn = <HTMLInputElement>document.getElementById("start-upload");
    send_order_btn.disabled = true;

    function func(obj:Object): void {
      // do something
    }
    let file = this.selectedFiles.item(0)
    this.currentUpload = new UploadModel(file);
    this.upSvc.pushUpload(this.currentUpload)
  }

  goBack(){
    this.navCtrl.pop({animate: true, duration: 0.3});    
  }

}
