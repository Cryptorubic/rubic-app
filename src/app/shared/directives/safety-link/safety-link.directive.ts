import { Directive, HostBinding, HostListener, Inject, Input, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';

@Directive({
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

  constructor(@Inject(PLATFORM_ID) private platformId: string, private router: Router) {}

  @HostListener('click', ['$event'])
  private linkClick(event: MouseEvent): void {
    if (!this.isLinkExternal()) {
      event.preventDefault();
      this.router.navigate([this._link]);
    }
  }

  private isLinkExternal(): boolean {
    return this._link.includes(location.protocol);
  }
}
