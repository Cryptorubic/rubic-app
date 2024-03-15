import { Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private renderer: Renderer2;

  constructor(
    rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private readonly document: Document
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  public updateMetaTagRobots(): void {
    const metaTagRobots = Array.from(this.document.getElementsByTagName('meta')).filter(
      meta => meta.name === 'robots'
    )[0];

    if (metaTagRobots) {
      this.renderer.removeAttribute(metaTagRobots, 'content');
      this.renderer.setAttribute(metaTagRobots, 'content', 'noindex');
    }
  }
}
