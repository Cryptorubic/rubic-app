import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ContentLoaderService {
  private content: Content;

  constructor(private httpClient: HttpClient) {}

  public async load(url: string) {
    this.content = (await this.httpClient.get(url).toPromise()) as Content;
  }

  getContent(contentType: CONTENT_TYPE): any {
    return this.content[contentType];
  }
}
