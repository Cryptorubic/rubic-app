import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { QueryParamsService } from '@app/core/services/query-params/query-params.service';
import { PrivateAction } from '../../constants/private-mode-tx-types';
import { BehaviorSubject, map } from 'rxjs';
import { animate, style, transition, trigger } from '@angular/animations';
import { PrivateTradeType } from '../../constants/private-trade-types';
import { PrivateActivityItem } from '../../models/activity-item';
import { ActivatedRoute, Router } from '@angular/router';
import { PRIVATE_MODE_URLS } from '@features/privacy/models/routes';
import { PrivateSwapFormConfig } from '../../providers/shared-privacy-providers/models/swap-form-types';
import { PrivateSwapInfo } from '../../providers/shared-privacy-providers/models/swap-info';
import { PrivacyMainPageService } from '../../services/privacy-main-page.service';
import { EmptyQuoteAdapter } from '../../providers/shared-privacy-providers/utils/empty-quote-adapter';
import { PrivateTransferInfo } from '../../providers/shared-privacy-providers/models/transfer-info';

@Component({
  selector: 'app-privacy-page-view',
  templateUrl: './privacy-page-view.component.html',
  styleUrls: ['./privacy-page-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('inOutAnimation', [
      transition(':enter', [
        style({ opacity: 0, scale: 0 }),
        animate('0.25s ease-in-out', style({ opacity: 1, scale: 1 }))
      ]),
      transition(':leave', [
        style({ opacity: 0.5, width: '360px', scale: 1 }),
        animate('0.25s ease-in-out', style({ opacity: 0, width: 0, scale: 0 }))
      ])
    ])
  ]
})
export class PrivacyPageViewComponent {
  public readonly swapWindowCreationConfig: PrivateSwapFormConfig = {
    withActionButton: false,
    withDstSelector: true,
    withDstAmount: false,
    withReceiver: false,
    withSrcAmount: false,
    assetsSelectorConfig: {
      withChainsFilter: false,
      withTokensFilter: false,
      withFavoriteTokens: false
    }
  };

  public readonly transferWindowCreationConfig: PrivateSwapFormConfig = {
    withActionButton: false,
    withDstSelector: false,
    withDstAmount: false,
    withReceiver: false,
    withSrcAmount: false,
    assetsSelectorConfig: {
      withChainsFilter: false,
      withTokensFilter: false,
      withFavoriteTokens: false
    }
  };

  public readonly quoteAdapter = new EmptyQuoteAdapter();

  public readonly receiverCtrl = new FormControl<string>('');

  public readonly privateProviders$ = this.privacyMainPageService.privateProviders$;

  public readonly lastActivity$ = this.privacyMainPageService.lastActivity$;

  public readonly selectedTradeType$ = this.privateProviders$.pipe(map(providers => providers[0]));

  public readonly useLargeIframe = this.queryParamsService.useLargeIframe;

  private readonly router = inject(Router);

  private readonly activatedRoute = inject(ActivatedRoute);

  public readonly selectedTab$ = this.privacyMainPageService.selectedTab$;

  private readonly _clearOutput$ = new BehaviorSubject<object>({});

  public readonly clearOutput$ = this._clearOutput$.asObservable();

  constructor(
    private readonly queryParamsService: QueryParamsService,
    private readonly privacyMainPageService: PrivacyMainPageService
  ) {}

  public handleTabSelected(selectedTab: string): void {
    const action = selectedTab as PrivateAction;
    if (action === 'Transfer') {
      const swapInfo = this.privacyMainPageService.formValue;
      this.privacyMainPageService.patchFormValue({
        toAsset: swapInfo.fromAsset
      });
      this._clearOutput$.next({});
    }
    this.privacyMainPageService.setSelectedTab(action);
  }

  public handleSwapWindowChanged(swapInfo: PrivateSwapInfo): void {
    this.privacyMainPageService.patchFormValue({
      fromAsset: swapInfo.fromAsset,
      toAsset: swapInfo.toAsset
    });
  }

  public handleTransferWindowChanged(transferInfo: PrivateTransferInfo): void {
    this.privacyMainPageService.patchFormValue({
      fromAsset: transferInfo.fromAsset,
      toAsset: transferInfo.fromAsset
    });
  }

  public async selectProvider(tradeType: PrivateTradeType): Promise<void> {
    const url = PRIVATE_MODE_URLS[tradeType];
    await this.router.navigate([url], { relativeTo: this.activatedRoute });
  }

  public async handleLastActivityClicked(activityItem: PrivateActivityItem): Promise<void> {
    const url = PRIVATE_MODE_URLS[activityItem.providerName as PrivateTradeType];
    await this.router.navigate([url], { relativeTo: this.activatedRoute });
  }
}
