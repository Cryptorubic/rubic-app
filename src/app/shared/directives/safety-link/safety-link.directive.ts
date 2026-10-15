import { Directive, HostBinding, Input } from '@angular/core';

@Directive({
  standalone: false,
  selector: '[safetyLink]'
})
export class SafetyLinkDirective {
  @HostBinding('attr.rel') relAttr: string = null;

  @HostBinding('attr.target') targetAttr: string = null;

  @HostBinding('attr.href') hrefAttr: string = null;

  @Input() set safetyLink(link: string) {
    if (link) {
      this._link = link;

      this.hrefAttr = link;
      if (this.isLinkExternal()) {
        this.relAttr = 'noopener';
        this.targetAttr = '_blank';
      }
    }
  }

  private _link: string;

  private isLinkExternal(): boolean {
    return !this._link.includes(window.location.origin);
  }
}
