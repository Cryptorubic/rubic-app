import { Directive, ElementRef, inject, Input } from '@angular/core';
import { Any } from 'rubic-sdk';
import { ComponentProps, createElement } from 'react';
import { createRoot } from 'react-dom/client';

@Directive({
  selector: '[reactRenderer]'
})
export class ReactRendererDirective {
  @Input() reactComponent: Any;

  @Input() props: ComponentProps<Any>;

  private root = createRoot(inject(ElementRef).nativeElement);

  ngOnChanges() {
    this.root.render(createElement(this.reactComponent, this.props));
  }

  ngOnDestroy() {
    this.root.unmount();
  }
}
