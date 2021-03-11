import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export abstract class ImageRepoService {

  // functions
  abstract getImagePhotoUrl(storageBaseUrl: string, uid: string): string;
}
