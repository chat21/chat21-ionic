import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { TYPE_MSG_IMAGE } from 'src/chat21-core/utils/constants';

@Component({
  selector: 'app-loader-preview',
  templateUrl: './loader-preview.page.html',
  styleUrls: ['./loader-preview.page.scss'],
})
export class LoaderPreviewPage implements OnInit {
  @ViewChild('thumbnailsPreview', {static: false}) thumbnailsPreview: ElementRef;
  @ViewChild('messageTextArea', {static: false}) messageTextArea: ElementRef;

  @Input() files: [any];

  public arrayFiles = [];
  public fileSelected: any;
  public messageString: string;
  public heightPreviewArea = '183';

  constructor() { }

  ngOnInit() {
    console.log('LoaderPreviewPage' );
    // tslint:disable-next-line: prefer-for-of
    for ( let i = 0; i < this.files.length; i++ ) {
      this.readAsDataURL(this.files[i]);
    }
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter LoaderPreviewPage', this.thumbnailsPreview.nativeElement.offsetHeight );
    this.calculateHeightPreviewArea();
  }

  readAsDataURL(file: any) {
    const reader = new FileReader();
    reader.onloadend = (evt) => {
        // const img = evt.target.result.toString();
        const img = reader.result.toString();
        console.log('read success');
        this.arrayFiles.push(img);
        if (!this.fileSelected) {
          this.fileSelected = img;
        }
    };
    reader.readAsDataURL(file);
  }


  calculateHeightPreviewArea() {
    const heightThumbnailsPreview = this.thumbnailsPreview.nativeElement.offsetHeight;
    const heightMessageTextArea = this.messageTextArea.nativeElement.offsetHeight;
    this.heightPreviewArea = (heightMessageTextArea + heightThumbnailsPreview).toString();
    console.log('heightThumbnailsPreview', heightThumbnailsPreview);
    console.log('heightMessageTextArea', this.messageTextArea);
    console.log('heightPreviewArea', this.heightPreviewArea);
  }

  uploadImages(){

  }


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

  /** */
  onSendMessage() {
    console.log('onSendMessage foto::', this.fileSelected);
    console.log('onSendMessage testo::', this.messageString);
    const text = this.messageString.replace(/(\r\n|\n|\r)/gm, '');
    if (text.trim() !== '') {
      // this.eventSendMessage.emit({ message: text, type: TYPE_MSG_IMAGE });
    }

  }

}
