import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';
import { takeUntil } from 'rxjs/operators';
import { TuiDestroyService } from '@taiga-ui/cdk';

@Directive({
  selector: '[onlyFrame]',
  providers: [TuiDestroyService]
})
export class OnlyFrameDirective<T> implements OnInit {
  @Input() onlyFrame: 'horizontal' | 'vertical' | 'any' = 'any';

  @Input() onlyFrameAnd = true;

  private $iframeSubscription: Subscription;

  constructor(
    private readonly templateRef: TemplateRef<T>,
    private readonly viewContainer: ViewContainerRef,
    private readonly iframeService: IframeService,
    private readonly destroy$: TuiDestroyService
  ) {}

  ngOnInit() {
    this.$iframeSubscription = this.iframeService.iframeAppearance$
      .pipe(takeUntil(this.destroy$))
      .subscribe(appearance => {
        const appearanceValues = ['horizontal', 'vertical'];
        if (!this.onlyFrameAnd) {
          this.viewContainer.clear();
          return;
        }
        if (!appearanceValues.includes(appearance)) {
          this.viewContainer.clear();
          return;
        }

        if (!this.onlyFrame || this.onlyFrame === 'any' || appearance === this.onlyFrame) {
          this.viewContainer.createEmbeddedView(this.templateRef);
        } else {
          this.viewContainer.clear();
        }
      });
  }
}
