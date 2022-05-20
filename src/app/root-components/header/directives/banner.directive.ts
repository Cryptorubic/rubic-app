import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appBanner]'
})
export class BannerDirective {
  @Input() set appBanner(value: string) {
    if (value) {
      this.renderer.setStyle(this.elementRef.nativeElement, 'background', value);
    }
  }

  @Input() set color(value: string) {
    if (value) {
      this.renderer.setStyle(this.elementRef.nativeElement, 'color', value);
    }
  }

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {
    renderer.addClass(elementRef.nativeElement, 'banner');
  }
}
