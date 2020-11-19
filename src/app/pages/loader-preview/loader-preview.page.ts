import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-loader-preview',
  templateUrl: './loader-preview.page.html',
  styleUrls: ['./loader-preview.page.scss'],
})
export class LoaderPreviewPage implements OnInit {

  @Input() files: [any];

  public arrayFiles = [];
  public fileSelected: any;
  public heightMessageTextArea: string;

  slideOpts = {
    init: true,
    initialSlide: 1,
    width: 200,
    direction: 'horizontal',
    roundLengths: true,
    speed: 400,
    effect: 'slide',
    spaceBetween: 50,
    slidesPerView: 2,
    centeredSlides: true
  };

  slideOptsTwo = {
    initialSlide: 1,
    slidesPerView: 4,
    loop: false,
    centeredSlides: false,
    spaceBetween: 10,
  };

  
  constructor() { }

  ngOnInit() {

    // this.urlImage = URL.createObjectURL(this.file);
    console.log('LoaderPreviewPage' );
    // tslint:disable-next-line: prefer-for-of
    for ( let i = 0; i < this.files.length; i++ ) {
      this.readAsDataURL(this.files[i]);
    }
    // this.files.forEach(element => {
    
    // });
  }


  readAsDataURL(file: any) {
    const reader = new FileReader();
    reader.onloadend = (evt) => {
        const img = evt.target.result.toString();
        console.log('read success');
        this.arrayFiles.push(img);
        if (!this.fileSelected) {
          this.fileSelected = img;
        }
    };
    reader.readAsDataURL(file);
  }


  /** */
  onChangeTextArea(e: any) {
    console.log('onChangeTextArea', e.target.clientHeight);
    try {
      let height: number = e.target.offsetHeight;
      if (height < 37 ) {
        height = 37;
      }
      this.heightMessageTextArea = (height + 139).toString();
    } catch (e) {
      this.heightMessageTextArea = '176';
    }
    console.log('heightMessageTextArea', this.heightMessageTextArea);
  }

  /** */
  onSelectImage(file: any) {
    this.fileSelected = file;
  }

}
