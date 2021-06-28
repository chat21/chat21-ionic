import { Component, OnInit, Input, Output, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { TYPE_MSG_IMAGE } from 'src/chat21-core/utils/constants';
import { NavParams, ModalController } from '@ionic/angular';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
@Component({
  selector: 'app-loader-preview',
  templateUrl: './loader-preview.page.html',
  styleUrls: ['./loader-preview.page.scss'],
})
export class LoaderPreviewPage implements OnInit {
  @ViewChild('thumbnailsPreview', { static: false }) thumbnailsPreview: ElementRef;
  @ViewChild('messageTextArea', { static: false }) messageTextArea: ElementRef;
  // @Output() eventSendMessage = new EventEmitter<object>();
  @Input() files: [any];

  public arrayFiles = [];
  public fileSelected: any;
  public messageString: string;
  public heightPreviewArea = '183';
  private selectedFiles: any;
  srcData: SafeResourceUrl;

  constructor(
    public viewCtrl: ModalController,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    console.log('LoaderPreviewPage');
    // tslint:disable-next-line: prefer-for-of
    this.selectedFiles = this.files;
    for (let i = 0; i < this.files.length; i++) {
      this.readAsDataURL(this.files[i]);
      //this.fileChange(this.files[i]);
    }
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter LoaderPreviewPage', this.thumbnailsPreview.nativeElement.offsetHeight);
    this.calculateHeightPreviewArea();
  }

  readAsDataURL(file: any) {
    console.log('LoaderPreviewPage readAsDataURL file', file);
    // ---------------------------------------------------------------------
    // USE CASE IMAGE
    // ---------------------------------------------------------------------
    if (file.type.startsWith("image") && (!file.type.includes('svg'))) {

      console.log('LoaderPreviewPage readAsDataURL file TYPE', file.type);
      const reader = new FileReader();
      reader.onloadend = (evt) => {
        const img = reader.result.toString();
        console.log('FileReader success ', img);
        this.arrayFiles.push(img);
        if (!this.fileSelected) {
          this.fileSelected = img;
        }
      };

      reader.readAsDataURL(file);
      // ---------------------------------------------------------------------
      // USE CASE SVG 
      // ---------------------------------------------------------------------
    } else if (file.type.startsWith("image") && (file.type.includes('svg'))) {
      // this.previewFiles(file)

      console.log('FIREBASE-UPLOAD LoaderPreviewPage readAsDataURL file TYPE', file.type);
      console.log('FIREBASE-UPLOAD LoaderPreviewPage readAsDataURL file ', file);
      const preview = document.querySelector('#img-preview') as HTMLImageElement;


      const reader = new FileReader();
      const that = this;
      reader.addEventListener("load", function () {
        // convert image file to base64 string
        // const img = reader.result as string;
        const img = reader.result.toString();
        console.log('FIREBASE-UPLOAD LoaderPreviewPage readAsDataURL img ', img);

        // that.fileSelected = that.sanitizer.bypassSecurityTrustResourceUrl(img);

        that.arrayFiles.push(that.sanitizer.bypassSecurityTrustResourceUrl(img));
        if (!that.fileSelected) {
          that.fileSelected = that.sanitizer.bypassSecurityTrustResourceUrl(img);
        }
      }, false);

      if (file) {

        reader.readAsDataURL(file);
      }



      // ---------------------------------------------------------------------
      // USE CASE FILE
      // ---------------------------------------------------------------------
    } else if (file.type.startsWith("application") || file.type.startsWith("video") || file.type.startsWith("audio") ) {
      console.log('FIREBASE-UPLOAD LoaderPreviewPage readAsDataURL file TYPE', file.type);

      this.createFile();

    }
  }
  // file-alt-solid.png
  async createFile() {
    let response = await fetch('./assets/images/file-alt-solid.png');
    let data = await response.blob();
    let metadata = {
      type: 'image/png'
    };
    let file = new File([data], "test.png", metadata);
    console.log('LoaderPreviewPage createFile file', file);
    const reader = new FileReader();
    reader.onloadend = (evt) => {
      const img = reader.result.toString();
      console.log('FileReader success ', img);
      this.arrayFiles.push(img);
      if (!this.fileSelected) {
        this.fileSelected = img;
      }
    };
    reader.readAsDataURL(file);
  }


  // for svg

  previewFiles(file) {

    console.log('LoaderPreviewPage readAsDataURL file TYPE', file.type);
    console.log('LoaderPreviewPage readAsDataURL file ', file);
    const preview = document.querySelector('#img-preview');
    console.log('LoaderPreviewPage readAsDataURL preview ', preview);

    this.readAndPreview(file, preview)
  }


  readAndPreview(file, preview) {
    console.log('LoaderPreviewPage readAsDataURL preview HERE 1');
    // Make sure `file.name` matches our extensions criteria
    if (/\.(jpe?g|png|gif|svg)$/i.test(file.name)) {
      var reader = new FileReader();

      reader.addEventListener("load", function () {
        var image = new Image();
        image.height = 100;
        image.title = file.name;
        image.src = this.result.toString();
        console.log('LoaderPreviewPage readAsDataURL preview image.src ', image.src);
        // preview.appendChild(image);

        preview.src(image);
      }, false);

      reader.readAsDataURL(file);
    }

    if (file) {
      [].forEach.call(file, this.readAndPreview);
    }

  }


  // NOT USED    
  fileChange(file) {
    console.log('fileChange');
    const that = this;
    if (file) {
      const nameImg = file.name;
      const typeFile = file.type;
      console.log('nameImg: ', nameImg);
      console.log('typeFile: ', typeFile);

      const reader = new FileReader();
      reader.addEventListener('load', function () {
        const img = reader.result.toString();
        console.log('FileReader success');
        that.arrayFiles.push(img);
        if (!that.fileSelected) {
          that.fileSelected = img;
        }

        if (typeFile.indexOf('image') !== -1) {
          const file4Load = new Image;
          file4Load.src = reader.result.toString();
          file4Load.title = nameImg;
          file4Load.onload = function () {
            console.log('that.file4Load: ', file4Load);
            //that.arrayFiles.push(file4Load);
            const uid = file4Load.src.substring(file4Load.src.length - 16);
            const metadata = {
              'name': file4Load.title,
              'src': file4Load.src,
              'width': file4Load.width,
              'height': file4Load.height,
              'type': typeFile,
              'uid': uid
            };
            // const type_msg = 'image';
            // 1 - invio messaggio
            //that.viewCtrl.dismiss({fileSelected: file4Load, messageString: that.messageString});
            //that.addLocalMessage(metadata, type_msg);
            // 2 - carico immagine
            //that.uploadSingle(metadata, type_msg);
          };
        }
        /*
        else if (typeFile.indexOf('application') !== -1) {
          const type_msg = 'file';
          const file = that.selectedFiles.item(0);
          const metadata = {
            'name': file.name,
            'src': event.target.files[0].src,
            'type': type_msg
          };

          // 1 - invio messaggio
          that.addLocalMessage(metadata, type_msg);
          // 2 - carico immagine
          that.uploadSingle(metadata, type_msg);
        }
        */
      }, false);
      if (file) {
        reader.readAsDataURL(file);
      }
    }
  }

  calculateHeightPreviewArea() {
    const heightThumbnailsPreview = this.thumbnailsPreview.nativeElement.offsetHeight;
    const heightMessageTextArea = this.messageTextArea.nativeElement.offsetHeight;
    this.heightPreviewArea = (heightMessageTextArea + heightThumbnailsPreview).toString();
    console.log('heightThumbnailsPreview', heightThumbnailsPreview);
    console.log('heightMessageTextArea', this.messageTextArea);
    console.log('heightPreviewArea', this.heightPreviewArea);
  }

  uploadImages() { }


  /** */
  onChangeTextArea(e: any) {
    console.log('onChangeTextArea', e.target.clientHeight);
    this.calculateHeightPreviewArea();
    // try {
    //   let height: number = e.target.offsetHeight;
    //   if (height < 37 ) {
    //     height = 37;
    //   }
    //   this.heightPreviewArea = (height + 139).toString();
    // } catch (e) {
    //   this.heightPreviewArea = '176';
    // }
  }

  /** */
  onSelectImage(file: any) {
    this.fileSelected = file;
  }

  pressedOnKeyboard(e: any, text: string) {
    console.log('pressedOnKeyboard ************** event:: ', e);
    // const message = e.target.textContent.trim();
    // if (e.inputType === 'insertLineBreak' && message === '') {
    //   this.messageString = '';
    //   return;
    // } else {
    //   this.messageString = '';

    // }
    this.onSendMessage()
  }

  /** */
  onSendMessage() {
    console.log('onSendMessage testo::', this.messageString);
    const file = this.selectedFiles.item(0);
    const file4Load = new Image;
    const nameImg = file.name;
    const typeFile = file.type;

    file4Load.src = this.fileSelected;
    file4Load.title = nameImg;
    const uid = file4Load.src.substring(file4Load.src.length - 16);
    const metadata = {
      'name': file4Load.title,
      'src': file4Load.src,
      'width': file4Load.width,
      'height': file4Load.height,
      'type': typeFile,
      'uid': uid
    };
    this.viewCtrl.dismiss({ fileSelected: file, messageString: this.messageString, metadata: metadata, type: TYPE_MSG_IMAGE });
  }

  async onClose() {
    this.viewCtrl.dismiss();
  }
}
