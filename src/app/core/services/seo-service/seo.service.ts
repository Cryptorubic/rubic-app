import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  constructor() {}

  public updMetaTagRobots(): void {
    const metaTagRobots = Array.from(document.getElementsByTagName('meta')).filter(
      meta => meta.name === 'robots'
    )[0];

    if (metaTagRobots) {
      metaTagRobots.content = 'noindex';
    }
  }
}
