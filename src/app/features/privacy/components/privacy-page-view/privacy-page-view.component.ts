import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { QueryParamsService } from '@app/core/services/query-params/query-params.service';
import { PRIVATE_MODE_TAB, PrivateModeTab } from '../../constants/private-mode-tab';
import { filter, first, map } from 'rxjs';
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
import { PrivacyMainPageTokensFacadeService } from '../../services/privacy-main-page-tokens-facade.service';
import { getEmptySwapFormInput } from '../../utils/empty-swap-form-input';
import { List } from 'immutable';
import { PRIVATE_MODE_SUPPORTED_CHAINS } from '../../constants/private-mode-supported-chains';
import { PRIVATE_MODE_SUPPORTED_TOKENS } from '../../constants/private-mode-supported-tokens';
import { StoreService } from '@core/services/store/store.service';
import { ModalService } from '@core/modals/services/modal.service';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import {
  PRIVATE_TAB_TO_FLOW_TYPE_EVENT,
  PRIVATE_TRADE_TYPE_TO_PROVIDER_NAME_EVENT
} from '@core/services/google-tag-manager/models/google-tag-manager';

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
export class PrivacyPageViewComponent implements OnInit {
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
      showAllChains: false
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
      showAllChains: false
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

  private readonly store = inject(StoreService);

  private readonly modalService = inject(ModalService);

  private readonly gtmService = inject(GoogleTagManagerService);

  constructor(
    private readonly queryParamsService: QueryParamsService,
    private readonly privacyMainPageService: PrivacyMainPageService,
    private readonly privateQueryParamsService: PrivateQueryParamsService,
    private readonly privacyMainPageTokensFacadeService: PrivacyMainPageTokensFacadeService
  ) {}

  ngOnInit(): void {
    this.gtmService.fireViewPrivateModePageEvent();
    this.parseQueryParams();
  }

  private parseQueryParams(): void {
    this.privacyMainPageTokensFacadeService
      .getTokensList('allChains', '', 'from', getEmptySwapFormInput())
      .pipe(
        filter(tokens => tokens.length > 0),
        first()
      )
      .subscribe(supportedTokens => {
        this.privateQueryParamsService.parseMainSwapInfoAndQueryParams(List(supportedTokens));
      });
  }

  public handleTabSelected(tab: PrivateModeTab): void {
    const swapInfo = this.privacyMainPageService.formValue;
    if (tab === PRIVATE_MODE_TAB.ON_CHAIN) {
      if (
        swapInfo.fromAsset &&
        (!PRIVATE_MODE_SUPPORTED_CHAINS[PRIVATE_MODE_TAB.ON_CHAIN].includes(
          swapInfo.fromAsset.blockchain
        ) ||
          !PRIVATE_MODE_SUPPORTED_TOKENS[swapInfo.fromAsset.blockchain].includes(
            swapInfo.fromAsset.address
          ))
      ) {
        this.privacyMainPageService.patchFormValue({
          fromAsset: null,
          toAsset: null
        });
      } else if (
        (swapInfo.toAsset &&
          (!PRIVATE_MODE_SUPPORTED_CHAINS[PRIVATE_MODE_TAB.ON_CHAIN].includes(
            swapInfo.toAsset.blockchain
          ) ||
            !PRIVATE_MODE_SUPPORTED_TOKENS[swapInfo.toAsset.blockchain].includes(
              swapInfo.toAsset.address
            ))) ||
        (swapInfo.fromAsset &&
          swapInfo.toAsset &&
          (swapInfo.fromAsset.blockchain !== swapInfo.toAsset.blockchain ||
            compareTokens(swapInfo.fromAsset, swapInfo.toAsset)))
      ) {
        this.privacyMainPageService.patchFormValue({
          toAsset: null
        });
      }
    } else if (tab === PRIVATE_MODE_TAB.CROSS_CHAIN) {
      if (
        swapInfo.fromAsset &&
        !PRIVATE_MODE_SUPPORTED_CHAINS[PRIVATE_MODE_TAB.CROSS_CHAIN].includes(
          swapInfo.fromAsset.blockchain
        )
      ) {
        this.privacyMainPageService.patchFormValue({
          fromAsset: null,
          toAsset: null
        });
      } else if (
        (swapInfo.toAsset &&
          !PRIVATE_MODE_SUPPORTED_CHAINS[PRIVATE_MODE_TAB.CROSS_CHAIN].includes(
            swapInfo.toAsset.blockchain
          )) ||
        (swapInfo.fromAsset &&
          swapInfo.toAsset &&
          (swapInfo.fromAsset.blockchain === swapInfo.toAsset.blockchain ||
            compareTokens(swapInfo.fromAsset, swapInfo.toAsset)))
      ) {
        this.privacyMainPageService.patchFormValue({
          toAsset: null
        });
      }
    } else if (tab === PRIVATE_MODE_TAB.TRANSFER) {
      if (swapInfo.fromAsset && !compareTokens(swapInfo.fromAsset, swapInfo.toAsset)) {
        this.privacyMainPageService.patchFormValue({
          toAsset: swapInfo.fromAsset
        });
      }
    }
    this.privacyMainPageService.setSelectedTab(tab);
  }

  public handleSwapWindowChanged(swapInfo: PrivacyFormValue): void {
    if (swapInfo.fromAsset && swapInfo.toAsset) {
      if (compareTokens(swapInfo.fromAsset, swapInfo.toAsset)) {
        this.privacyMainPageService.setSelectedTab(PRIVATE_MODE_TAB.TRANSFER);
      } else {
        if (swapInfo.fromAsset?.blockchain === swapInfo.toAsset?.blockchain) {
          this.privacyMainPageService.setSelectedTab(PRIVATE_MODE_TAB.ON_CHAIN);
        } else {
          this.privacyMainPageService.setSelectedTab(PRIVATE_MODE_TAB.CROSS_CHAIN);
        }
      }
    }
    this.privateQueryParamsService.setQueryParams(swapInfo);
  }

  public async selectProvider(tradeType: PrivateTradeType): Promise<void> {
    this.gtmService.fireSelectPrivateProviderEvent(
      PRIVATE_TAB_TO_FLOW_TYPE_EVENT[this.privacyMainPageService.selectedTab],
      PRIVATE_TRADE_TYPE_TO_PROVIDER_NAME_EVENT[tradeType],
      this.privacyMainPageService.showAllProviders
    );

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
