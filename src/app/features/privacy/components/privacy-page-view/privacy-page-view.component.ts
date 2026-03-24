import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { QueryParamsService } from '@app/core/services/query-params/query-params.service';
import { PRIVATE_MODE_TAB, PrivateModeTab } from '../../constants/private-mode-tab';
import { map } from 'rxjs';
import { animate, style, transition, trigger } from '@angular/animations';
import { PrivateTradeType } from '../../constants/private-trade-types';
import { PrivateActivityItem } from '../../models/activity-item';
import { ActivatedRoute, Router } from '@angular/router';
import { PRIVATE_MODE_URLS } from '@features/privacy/models/routes';
import { PrivateSwapFormConfig } from '../../providers/shared-privacy-providers/models/swap-form-types';
import { PrivacyMainPageService } from '../../services/privacy-main-page.service';
import { EmptyQuoteAdapter } from '../../providers/shared-privacy-providers/utils/empty-quote-adapter';
import { PrivateQueryParamsService } from '../../providers/shared-privacy-providers/services/query-params/private-query-params.service';
import { PrivacyFormValue } from '../../services/models/privacy-form';
import { SwapsFormService } from '@app/features/trade/services/swaps-form/swaps-form.service';
import { compareTokens } from '@app/shared/utils/utils';

@Component({
  selector: 'app-privacy-page-view',
  templateUrl: './privacy-page-view.component.html',
  styleUrls: ['./privacy-page-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: SwapsFormService, useClass: SwapsFormService }],
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
      withFavoriteTokens: false,
      showAllChains: true
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
      withFavoriteTokens: false,
      showAllChains: true
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

  public readonly tabs = Object.values(PRIVATE_MODE_TAB);

  constructor(
    private readonly queryParamsService: QueryParamsService,
    private readonly privacyMainPageService: PrivacyMainPageService,
    private readonly privateQueryParamsService: PrivateQueryParamsService
  ) {}

  public handleTabSelected(tab: PrivateModeTab): void {
    if (tab === PRIVATE_MODE_TAB.TRANSFER) {
      const swapInfo = this.privacyMainPageService.formValue;
      this.privacyMainPageService.patchFormValue({
        toAsset: swapInfo.fromAsset
      });
    }
    this.privacyMainPageService.setSelectedTab(tab);
  }

  public handleSwapWindowChanged(swapInfo: PrivacyFormValue): void {
    if (!swapInfo.fromAsset || !swapInfo.toAsset) {
      this.privacyMainPageService.setSelectedTab(PRIVATE_MODE_TAB.ON_CHAIN);
    } else if (compareTokens(swapInfo.fromAsset, swapInfo.toAsset)) {
      this.privacyMainPageService.setSelectedTab(PRIVATE_MODE_TAB.TRANSFER);
    } else {
      if (swapInfo.fromAsset?.blockchain === swapInfo.toAsset?.blockchain) {
        this.privacyMainPageService.setSelectedTab(PRIVATE_MODE_TAB.ON_CHAIN);
      } else {
        this.privacyMainPageService.setSelectedTab(PRIVATE_MODE_TAB.CROSS_CHAIN);
      }
    }
    this.privateQueryParamsService.setQueryParams(swapInfo);
  }

  public async selectProvider(tradeType: PrivateTradeType): Promise<void> {
    const url = PRIVATE_MODE_URLS[tradeType];
    await this.router.navigate([url], {
      relativeTo: this.activatedRoute,
      queryParamsHandling: 'merge'
    });
  }

  public async handleLastActivityClicked(activityItem: PrivateActivityItem): Promise<void> {
    const url = PRIVATE_MODE_URLS[activityItem.providerName as PrivateTradeType];
    await this.router.navigate([url], {
      relativeTo: this.activatedRoute,
      queryParamsHandling: 'merge'
    });
  }
}
