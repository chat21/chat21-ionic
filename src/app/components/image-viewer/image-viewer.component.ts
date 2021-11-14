import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-image-viewer',
  templateUrl: './image-viewer.component.html',
  styleUrls: ['./image-viewer.component.scss'],
})
export class ImageViewerComponent implements OnInit {

  constructor() { }

  ngOnInit() {}

  closeImageViewerModal() {
    console.log('HAS CLICKED CLOSE MODAL')
    var modal = document.getElementById("image-viewer-modal");
    // var span = document.getElementsByClassName("close")[0]; 
    modal.style.display = "none";
  }

  downloadImage()  {
    var modalImg = <HTMLImageElement>document.getElementById("image-viewer-img")
    console.log('HAS CLICKED CLOSE DWNLD IMG modalImg ', modalImg)
    var modalImgURL = modalImg.src;
    console.log('HAS CLICKED CLOSE DWNLD IMG modalImgURL ', modalImgURL)
    var captionText = document.getElementById("caption").innerHTML;
    console.log('HAS CLICKED CLOSE DWNLD IMG captionText ', captionText)

    const a: any = document.createElement('a');
    a.href = modalImgURL;
    a.download = captionText;
    document.body.appendChild(a);
    a.style = 'display: none';
    a.click();
    a.remove();
  }

}
