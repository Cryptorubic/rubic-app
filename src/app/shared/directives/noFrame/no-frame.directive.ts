import { TemplateRef, ViewContainerRef, Directive, OnInit, Input } from '@angular/core';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { takeUntil } from 'rxjs/operators';

@Directive({
  selector: '[noFrame]',
  providers: [TuiDestroyService]
})
export class NoFrameDirective<T> implements OnInit {
  @Input() noFrame: 'horizontal' | 'vertical' | 'any' = 'any';

  @Input() noFrameAnd = true;

  constructor(
    private readonly templateRef: TemplateRef<T>,
    private readonly viewContainer: ViewContainerRef,
    private readonly iframeService: IframeService,
    private readonly destroy$: TuiDestroyService
  ) {}

  ngOnInit() {
    this.iframeService.iframeAppearance$
      .pipe(takeUntil(this.destroy$))
      .subscribe(iframeAppearance => {
        if (!this.noFrameAnd) {
          this.viewContainer.clear();
          return;
        }
        if (!iframeAppearance || (iframeAppearance !== this.noFrame && this.noFrame !== 'any')) {
          this.viewContainer.createEmbeddedView(this.templateRef);
        } else {
          this.viewContainer.clear();
        }
      });
  }
}
