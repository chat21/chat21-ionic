import {
  Component,
  OnInit,
  Input,
  Output,
  ViewChild,
  ElementRef,
  EventEmitter,
  HostListener,
  AfterViewInit,
} from '@angular/core'
import { TYPE_MSG_IMAGE } from 'src/chat21-core/utils/constants'
import { NavParams, ModalController } from '@ionic/angular'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'

// Logger
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service'
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance'

@Component({
  selector: 'app-loader-preview',
  templateUrl: './loader-preview.page.html',
  styleUrls: ['./loader-preview.page.scss'],
})
export class LoaderPreviewPage implements OnInit, AfterViewInit {
  @ViewChild('thumbnailsPreview', { static: false })
  thumbnailsPreview: ElementRef
  @ViewChild('messageTextArea', { static: false }) messageTextArea: ElementRef
  @ViewChild('imageCaptionTexarea', { static: false }) imageCaptionTexarea: any
  // @Output() eventSendMessage = new EventEmitter<object>();
  @Input() files: [any]
  @Input() enableBackdropDismiss: any
  @Input() msg: string

  public arrayFiles = []
  public fileSelected: any
  public messageString: string
  public heightPreviewArea = '183'
  private selectedFiles: any
  srcData: SafeResourceUrl
  public file_extension: string
  public file_name: string
  public file_name_ellipsis_the_middle: string
  private logger: LoggerService = LoggerInstance.getInstance()

  constructor(
    public viewCtrl: ModalController,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit() {
    this.logger.log('[LOADER-PREVIEW-PAGE] Hello!')
    // tslint:disable-next-line: prefer-for-of
    this.selectedFiles = this.files
    for (let i = 0; i < this.files.length; i++) {
      this.readAsDataURL(this.files[i])
      //this.fileChange(this.files[i]);
    }
  }
  ngAfterViewInit() {
    this.logger.log('[LOADER-PREVIEW-PAGE] this.files', this.files)
    this.logger.log(
      '[LOADER-PREVIEW-PAGE] enableBackdropDismiss',
      this.enableBackdropDismiss,
    )
    this.logger.log('[LOADER-PREVIEW-PAGE] msg', this.msg)
    if (this.msg) {
      this.messageString = this.msg
    }

    if (this.imageCaptionTexarea) {
      setTimeout(() => {
        // this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] set focus on ", this.messageTextArea);
        // Keyboard.show() // for android
        this.logger.log(
          '[CONVS-DETAIL][MSG-TEXT-AREA] ngAfterViewInit this.imageCaptionTexarea ',
          this.imageCaptionTexarea,
        )
        this.imageCaptionTexarea.setFocus()
      }, 1000) //a least 150ms.
    }
  }

  ionViewDidEnter() {
    this.logger.log(
      '[LOADER-PREVIEW-PAGE] ionViewDidEnter thumbnailsPreview.nativeElement.offsetHeight',
      this.thumbnailsPreview.nativeElement.offsetHeight,
    )
    this.calculateHeightPreviewArea()
  }

  readAsDataURL(file: any) {
    this.logger.log('[LOADER-PREVIEW-PAGE] readAsDataURL file', file)
    // ---------------------------------------------------------------------
    // USE CASE IMAGE
    // ---------------------------------------------------------------------
    if (file.type.startsWith('image') && !file.type.includes('svg')) {
      this.logger.log(
        '[LOADER-PREVIEW-PAGE] - readAsDataURL - USE CASE IMAGE file TYPE',
        file.type,
      )
      const reader = new FileReader()
      reader.onloadend = (evt) => {
        const img = reader.result.toString()
        this.logger.log(
          '[LOADER-PREVIEW-PAGE] - readAsDataURL - FileReader success ',
          img,
        )
        this.arrayFiles.push(img)
        if (!this.fileSelected) {
          this.fileSelected = img
        }
      }

      reader.readAsDataURL(file)
      // ---------------------------------------------------------------------
      // USE CASE SVG
      // ---------------------------------------------------------------------
    } else if (file.type.startsWith('image') && file.type.includes('svg')) {
      // this.previewFiles(file)

      this.logger.log(
        '[LOADER-PREVIEW-PAGE] - readAsDataURL file TYPE',
        file.type,
      )
      this.logger.log('[LOADER-PREVIEW-PAGE] - readAsDataURL file ', file)
      const preview = document.querySelector('#img-preview') as HTMLImageElement

      const reader = new FileReader()
      const that = this
      reader.addEventListener(
        'load',
        function () {
          // convert image file to base64 string
          // const img = reader.result as string;
          const img = reader.result.toString()
          that.logger.log(
            'FIREBASE-UPLOAD USE CASE SVG LoaderPreviewPage readAsDataURL img ',
            img,
          )

          // that.fileSelected = that.sanitizer.bypassSecurityTrustResourceUrl(img);

          that.arrayFiles.push(
            that.sanitizer.bypassSecurityTrustResourceUrl(img),
          )
          if (!that.fileSelected) {
            that.fileSelected = that.sanitizer.bypassSecurityTrustResourceUrl(
              img,
            )
          }
        },
        false,
      )

      if (file) {
        reader.readAsDataURL(file)
      }

      // ---------------------------------------------------------------------
      // USE CASE FILE
      // ---------------------------------------------------------------------
      // } else if (file.type.startsWith("application") || file.type.startsWith("video") || file.type.startsWith("audio") ) {
    } else {
      this.logger.log(
        '[LOADER-PREVIEW-PAGE] - readAsDataURL - USE CASE FILE - FILE ',
        file,
      )
      this.logger.log(
        '[LOADER-PREVIEW-PAGE] - readAsDataURL - USE CASE FILE - FILE TYPE',
        file.type,
      )
      this.file_extension =
        file.name.substring(file.name.lastIndexOf('.') + 1, file.name.length) ||
        file.name
      this.logger.log(
        '[LOADER-PREVIEW-PAGE] - readAsDataURL - USE CASE FILE - FILE EXTENSION',
        this.file_extension,
      )
      this.file_name = file.name
      this.file_name_ellipsis_the_middle = this.start_and_end(file.name)
      this.logger.log(
        '[LOADER-PREVIEW-PAGE] - readAsDataURL - USE CASE FILE - FILE NAME',
        this.file_name,
      )
      // if (file.type) {
      //   const file_type_array = file.type.split('/');
      //   this.logger.log('FIREBASE-UPLOAD USE CASE FILE LoaderPreviewPage readAsDataURL file_type_array', file_type_array);
      //   this.file_type = file_type_array[1]
      // } else {
      //   this.file_type = file.name.substring(file.name.lastIndexOf('.')+1, file.name.length) || file.name;

      // }
      this.createFile()
    }
  }

  start_and_end(str) {
    if (str.length > 70) {
      return str.substr(0, 20) + '...' + str.substr(str.length - 10, str.length)
    }
    return str
  }
  // file-alt-solid.png
  async createFile() {
    let response = await fetch('./assets/images/file-alt-solid.png')
    let data = await response.blob()
    let metadata = {
      type: 'image/png',
    }
    let file = new File([data], 'test.png', metadata)
    this.logger.log('[LOADER-PREVIEW-PAGE] - createFile file - file', file)
    const reader = new FileReader()
    reader.onloadend = (evt) => {
      const img = reader.result.toString()
      this.logger.log(
        '[LOADER-PREVIEW-PAGE] - createFile file - FileReader success img',
        img,
      )
      this.arrayFiles.push(img)
      if (!this.fileSelected) {
        this.fileSelected = img
      }
    }
    reader.readAsDataURL(file)
  }

  // for svg

  // previewFiles(file) {
  //   this.logger.log('LoaderPreviewPage readAsDataURL file TYPE', file.type);
  //   this.logger.log('LoaderPreviewPage readAsDataURL file ', file);
  //   const preview = document.querySelector('#img-preview');
  //   this.logger.log('LoaderPreviewPage readAsDataURL preview ', preview);
  //   this.readAndPreview(file, preview)
  // }

  // readAndPreview(file, preview) {
  //   this.logger.log('LoaderPreviewPage readAsDataURL preview HERE 1');
  //   // Make sure `file.name` matches our extensions criteria
  //   if (/\.(jpe?g|png|gif|svg)$/i.test(file.name)) {
  //     var reader = new FileReader();

  //     reader.addEventListener("load", function () {
  //       var image = new Image();
  //       image.height = 100;
  //       image.title = file.name;
  //       image.src = this.result.toString();
  //       this.logger.log('LoaderPreviewPage readAsDataURL preview image.src ', image.src);
  //       // preview.appendChild(image);

  //       preview.src(image);
  //     }, false);

  //     reader.readAsDataURL(file);
  //   }

  //   if (file) {
  //     [].forEach.call(file, this.readAndPreview);
  //   }

  // }

  // NOT USED
  fileChange(file) {
    this.logger.log('fileChange')
    const that = this
    if (file) {
      const nameImg = file.name
      const typeFile = file.type
      this.logger.log('nameImg: ', nameImg)
      this.logger.log('typeFile: ', typeFile)

      const reader = new FileReader()
      reader.addEventListener(
        'load',
        function () {
          const img = reader.result.toString()
          that.logger.log('FileReader success')
          that.arrayFiles.push(img)
          if (!that.fileSelected) {
            that.fileSelected = img
          }

          if (typeFile.indexOf('image') !== -1) {
            const file4Load = new Image()
            file4Load.src = reader.result.toString()
            file4Load.title = nameImg
            file4Load.onload = function () {
              that.logger.log('that.file4Load: ', file4Load)
              //that.arrayFiles.push(file4Load);
              const uid = file4Load.src.substring(file4Load.src.length - 16)
              const metadata = {
                name: file4Load.title,
                src: file4Load.src,
                width: file4Load.width,
                height: file4Load.height,
                type: typeFile,
                uid: uid,
              }
              // const type_msg = 'image';
              // 1 - invio messaggio
              //that.viewCtrl.dismiss({fileSelected: file4Load, messageString: that.messageString});
              //that.addLocalMessage(metadata, type_msg);
              // 2 - carico immagine
              //that.uploadSingle(metadata, type_msg);
            }
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
        },
        false,
      )
      if (file) {
        reader.readAsDataURL(file)
      }
    }
  }

  calculateHeightPreviewArea() {
    const heightThumbnailsPreview = this.thumbnailsPreview.nativeElement
      .offsetHeight
    const heightMessageTextArea = this.messageTextArea.nativeElement
      .offsetHeight
    this.heightPreviewArea = (
      heightMessageTextArea + heightThumbnailsPreview
    ).toString()
    // this.logger.log('heightThumbnailsPreview', heightThumbnailsPreview);
    // this.logger.log('heightMessageTextArea', this.messageTextArea);
    // this.logger.log('heightPreviewArea', this.heightPreviewArea);
  }

  uploadImages() {}

  /** */
  onChangeTextArea(e: any) {
    this.logger.log('onChangeTextArea', e.target.clientHeight)
    this.calculateHeightPreviewArea()
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
    this.fileSelected = file
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onSendMessage()
    }
  }

  pressedOnKeyboard(e: any, text: string) {
    this.logger.log('[LOADER-PREVIEW-PAGE] pressedOnKeyboard - event:: ', e)
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
    this.logger.log(
      '[LOADER-PREVIEW-PAGE] onSendMessage messageString:',
      this.messageString,
    )
    let file = this.selectedFiles.item(0)
    const file4Load = new Image()
    const nameImg = file.name
    const typeFile = file.type

    file4Load.src = this.fileSelected
    file4Load.title = nameImg
    const uid = file4Load.src.substring(file4Load.src.length - 16)
    const metadata = {
      name: file4Load.title,
      src: file4Load.src,
      width: file4Load.width,
      height: file4Load.height,
      type: typeFile,
      uid: uid,
    }
    this.viewCtrl.dismiss({
      fileSelected: file,
      messageString: this.messageString,
      metadata: metadata,
      type: TYPE_MSG_IMAGE,
    })
  }

  async onClose() {
    this.viewCtrl.dismiss()
  }
}
