import { Injectable } from '@angular/core';
import {
  Content,
  VolumeContent,
  TeamCardContent
} from 'src/app/shared/models/content';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ContentLoaderService {
  private content: Content;

  get volumeContent(): VolumeContent {
    return this.content.volume;
  }

  get teamCardsContent(): TeamCardContent[] {
    return this.content.team;
  }

  constructor(private httpClient: HttpClient) {}

  public async fetchContent() {
    this.content = (await this.httpClient
      .get(`assets/content/content.json?v=${Date.now()}`)
      .toPromise()) as Content;
  }
}
