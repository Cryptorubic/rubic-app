import {
  Directive,
  ElementRef,
  HostBinding,
  Inject,
  Input,
  OnChanges,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[safetyLink]'
})
export class SafetyLinkDirective implements OnChanges {
  @HostBinding('attr.rel') relAttr = null;

  @HostBinding('attr.target') targetAttr = null;

  @HostBinding('attr.href') hrefAttr = null;

  @Input() href: string;

  constructor(@Inject(PLATFORM_ID) private platformId: string, private elementRef: ElementRef) {}

  ngOnChanges() {
    this.hrefAttr = this.href;

    if (this.isLinkExternal()) {
      this.relAttr = 'noopener';
      this.targetAttr = '_blank';
    } else {
      this.targetAttr = '_self';
    }
  }

  private isLinkExternal() {
    return isPlatformBrowser(this.platformId) && !this.href.includes(location.hostname);
  }
}
