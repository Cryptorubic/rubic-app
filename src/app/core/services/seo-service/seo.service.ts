import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  constructor() {
    this.addNoIndexTag();
  }

  private addNoIndexTag(): void {
    const head = document.getElementsByTagName('head')[0];
    console.log(head);
  }
}
