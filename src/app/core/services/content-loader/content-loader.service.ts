import { Injectable } from '@angular/core';
import { Content, VolumeContent } from 'src/app/shared/models/content';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ContentLoaderService {
  public content: Content;

  get volumeContent(): VolumeContent {
    return this.content.volume;
  }

  constructor(private httpClient: HttpClient) {}

  public async fetchContent() {
    this.content = (await this.httpClient
      .get(`assets/content/content.json?v=${Date.now()}`)
      .toPromise()) as Content;
  }
}
