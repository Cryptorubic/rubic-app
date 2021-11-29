import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { QueryParamsService } from 'src/app/core/services/query-params/query-params.service';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';

@Component({
  selector: 'app-iframe-wallets-warning',
  templateUrl: './iframe-wallets-warning.component.html',
  styleUrls: ['./iframe-wallets-warning.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IframeWalletsWarningComponent {
  public get noFrameLink(): string {
    return `https://app.rubic.exchange${this.queryParamsService.noFrameLink}`;
  }

  public get appearance(): 'vertical' | 'horizontal' {
    return this.iframeService.iframeAppearance;
  }

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext<void>,
    private readonly queryParamsService: QueryParamsService,
    private readonly iframeService: IframeService
  ) {}

  public onCancel(): void {
    this.context.completeWith();
  }
}
