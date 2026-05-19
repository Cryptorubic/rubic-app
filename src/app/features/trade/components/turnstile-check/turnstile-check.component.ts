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
  public readonly title: string = this.context.title;

  constructor(
    private readonly turnstileService: TurnstileService,
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<boolean> & { title: string }
  ) {}

  ngAfterViewInit(): void {
    this.turnstileService
      .createWidget()
      .then(success => this.context.completeWith(success))
      .catch(() => this.context.completeWith(false));
  }
}
