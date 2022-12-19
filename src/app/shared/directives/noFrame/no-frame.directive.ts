import { TemplateRef, ViewContainerRef, Directive, OnInit, Input } from '@angular/core';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';

@Directive({
  selector: '[noFrame]'
})
export class NoFrameDirective<T> implements OnInit {
  @Input() noFrame: 'horizontal' | 'vertical' | '' = '';

  @Input() noFrameAnd = true;

  constructor(
    private readonly templateRef: TemplateRef<T>,
    private readonly viewContainer: ViewContainerRef,
    private readonly iframeService: IframeService
  ) {}

  ngOnInit() {
    if (!this.noFrameAnd) {
      this.viewContainer.clear();
      return;
    }

    const iframeAppearance = this.iframeService.iframeAppearance;
    if (!iframeAppearance || (this.noFrame && iframeAppearance !== this.noFrame)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
