import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';

@Directive({
  selector: '[onlyFrame]'
})
export class OnlyFrameDirective<T> implements OnInit {
  @Input() onlyFrame: 'horizontal' | 'vertical' | '' = '';

  @Input() onlyFrameAnd = true;

  constructor(
    private readonly templateRef: TemplateRef<T>,
    private readonly viewContainer: ViewContainerRef,
    private readonly iframeService: IframeService
  ) {}

  ngOnInit() {
    if (!this.onlyFrameAnd) {
      this.viewContainer.clear();
      return;
    }

    const iframeAppearance = this.iframeService.iframeAppearance;
    if (iframeAppearance && (!this.onlyFrame || iframeAppearance === this.onlyFrame)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
