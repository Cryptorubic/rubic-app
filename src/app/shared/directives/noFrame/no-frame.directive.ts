import { TemplateRef, ViewContainerRef, Directive, OnInit, OnDestroy, Input } from '@angular/core';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[noFrame]'
})
export class NoFrameDirective<T> implements OnInit, OnDestroy {
  private $iframeSubscription: Subscription;

  @Input() noFrame: 'horizontal' | 'vertical' | 'any' = 'any';

  constructor(
    private readonly templateRef: TemplateRef<T>,
    private readonly viewContainer: ViewContainerRef,
    private readonly iframeService: IframeService
  ) {}

  ngOnInit() {
    this.$iframeSubscription = this.iframeService.iframeAppearance$.subscribe(iframeAppearance => {
      if (!iframeAppearance || (iframeAppearance !== this.noFrame && this.noFrame !== 'any')) {
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
