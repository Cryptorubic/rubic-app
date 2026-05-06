import { Directive, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { IframeService } from '@core/services/iframe-service/iframe.service';

@Directive({
  selector: '[noFrame]',
  standalone: false
})
export class NoFrameDirective<T> implements OnInit {
  constructor(
    private readonly templateRef: TemplateRef<T>,
    private readonly viewContainer: ViewContainerRef,
    private readonly iframeService: IframeService
  ) {}

  ngOnInit() {
    if (!this.iframeService.isIframe) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
