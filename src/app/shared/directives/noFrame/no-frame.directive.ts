import { TemplateRef, ViewContainerRef, Directive, OnInit, OnDestroy } from '@angular/core';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[noFrame]'
})
export class NoFrameDirective<T> implements OnInit, OnDestroy {
  private $iframeSubscription: Subscription;

  constructor(
    private readonly templateRef: TemplateRef<T>,
    private readonly viewContainer: ViewContainerRef,
    private readonly iframeService: IframeService
  ) {}

  ngOnInit() {
    this.$iframeSubscription = this.iframeService.isIframe$.subscribe(isIframe => {
      if (!isIframe) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainer.clear();
      }
    });
  }

  ngOnDestroy() {
    this.$iframeSubscription.unsubscribe();
  }
}
