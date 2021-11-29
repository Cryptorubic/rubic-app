import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { QueryParamsService } from 'src/app/core/services/query-params/query-params.service';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';
import { RubicWindow } from '@shared/utils/rubic-window';
import { WINDOW } from '@ng-web-apis/common';

@Component({
  selector: 'app-iframe-wallets-warning',
  templateUrl: './iframe-wallets-warning.component.html',
  styleUrls: ['./iframe-wallets-warning.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IframeWalletsWarningComponent {
  public get noFrameLink(): string {
    return `${this.window.origin}${this.queryParamsService.noFrameLink}`;
  }

  public get appearance(): 'vertical' | 'horizontal' {
    return this.iframeService.iframeAppearance;
  }

  /**
   * Returns domain origin.
   */
  public get domain(): string {
    return this.window.location.hostname;
  }

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext<void>,
    private readonly queryParamsService: QueryParamsService,
    private readonly iframeService: IframeService,
    @Inject(WINDOW) private readonly window: RubicWindow
  ) {}

  public onCancel(): void {
    this.context.completeWith();
  }
}
