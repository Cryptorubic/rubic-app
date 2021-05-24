import { Directive, ElementRef, HostListener, Input, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';

@Directive({
  selector: '[wrapLink]'
})
export class WrapLinkDirective implements OnInit {
  constructor(private elementRef: ElementRef, private renderer: Renderer2, public router: Router) {}

  @Input() public isWrapLink: boolean;

  @Input() public href: string;

  @HostListener('click')
  private routeLink(): void {
    if (this.isWrapLink) this.router.navigateByUrl(this.href);
  }

  ngOnInit(): void {
    if (this.isWrapLink) this.wrapLink();
  }

  public wrapLink() {
    const link = this.renderer.createElement('a');
    this.renderer.setAttribute(link, 'href', this.href);
    this.renderer.listen(link, 'click', $event => $event.preventDefault());

    const el = this.elementRef.nativeElement;
    const parent = el.parentNode;
    this.renderer.insertBefore(parent, link, el);

    this.renderer.appendChild(link, el);
  }
}
