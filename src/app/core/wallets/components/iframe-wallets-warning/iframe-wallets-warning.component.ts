import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { QueryParamsService } from 'src/app/core/services/query-params/query-params.service';

@Component({
  selector: 'app-iframe-wallets-warning',
  templateUrl: './iframe-wallets-warning.component.html',
  styleUrls: ['./iframe-wallets-warning.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IframeWalletsWarningComponent {
  public get noFrameLink(): string {
    return `https://rubic.exchange${this.queryParamsService.noFrameLink}`;
  }

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext<void>,
    private readonly queryParamsService: QueryParamsService
  ) {}

  public onCancel() {
    this.context.completeWith();
  }
}
