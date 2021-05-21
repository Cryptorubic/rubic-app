import {
  Directive,
  HostBinding,
  HostListener,
  Inject,
  Input,
  OnInit,
  PLATFORM_ID
} from '@angular/core';
import { Router } from '@angular/router';

@Directive({
  selector: '[safetyLink]'
})
export class SafetyLinkDirective implements OnInit {
  @HostBinding('attr.rel') relAttr = null;

  @HostBinding('attr.target') targetAttr = null;

  @HostBinding('attr.href') hrefAttr = null;

  @Input() link: string;

  constructor(@Inject(PLATFORM_ID) private platformId: string, private router: Router) {}

  ngOnInit() {
    this.hrefAttr = this.link;
    if (this.isLinkExternal()) {
      this.relAttr = 'noopener';
      this.targetAttr = '_blank';
    }
  }

  @HostListener('click', ['$event'])
  private linkClick(event: MouseEvent) {
    if (!this.isLinkExternal()) {
      event.preventDefault();
      this.router.navigate([this.link]);
    }
  }

  private isLinkExternal() {
    return this.link.includes(location.protocol);
  }
}
