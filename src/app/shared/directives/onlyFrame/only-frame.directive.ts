import { Directive, Input, OnDestroy, TemplateRef, ViewContainerRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';

@Directive({
  selector: '[onlyFrame]'
})
export class OnlyFrameDirective<T> implements OnDestroy {
  private $iframeSubscription: Subscription;

  constructor(
    private readonly templateRef: TemplateRef<T>,
    private readonly viewContainer: ViewContainerRef,
    private readonly iframeService: IframeService
  ) {}

  @Input()
  set onlyFrame(value: 'horizontal' | 'vertical' | 'any' | undefined) {
    this.$iframeSubscription = this.iframeService.iframeAppearance$.subscribe(appearance => {
      const appearanceValues = ['horizontal', 'vertical'];
      if (!appearanceValues.includes(appearance)) {
        this.viewContainer.clear();
        return;
      }

      if (!value || value === 'any' || appearance === value) {
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
