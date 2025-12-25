import { AfterViewInit, ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { TurnstileService } from '@core/services/turnstile/turnstile.service';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';

@Component({
  selector: 'app-turnstile-check',
  templateUrl: './turnstile-check.component.html',
  styleUrls: ['./turnstile-check.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TurnstileCheckComponent implements AfterViewInit {
  constructor(
    private readonly turnstileService: TurnstileService,
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext<boolean>
  ) {}

  ngAfterViewInit(): void {
    this.turnstileService
      .createWidget('#turnstile-widget')
      .then(() => {
        this.context.completeWith(true);
      })
      .catch(() => {
        this.context.completeWith(false);
      });
  }
}
