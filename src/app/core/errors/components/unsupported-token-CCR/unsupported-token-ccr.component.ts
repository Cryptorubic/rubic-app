import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unsupported-token-ccr',
  templateUrl: './unsupported-token-ccr.component.html',
  styleUrls: ['./unsupported-token-ccr.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnsupportedTokenCCRComponent {
  public readonly questionId: string;

  constructor(
    private router: Router,
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<void, { questionId: string }>
  ) {
    this.questionId = context.data.questionId;
  }

  public navigateToFaq(): void {
    window.open(`faq#${this.questionId}`);
  }
}
