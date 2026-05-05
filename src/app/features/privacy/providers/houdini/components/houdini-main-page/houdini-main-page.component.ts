import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  Self,
  DestroyRef,
  inject
} from '@angular/core';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { HoudiniPrivateAssetsService } from '@app/features/privacy/providers/houdini/services/houdini-private-assets.service';
import { HoudiniSwapService } from '@app/features/privacy/providers/houdini/services/houdini-swap.service';
import { HoudiniTokensFacadeService } from '@app/features/privacy/providers/houdini/services/houdini-tokens-facade.service';
import { HoudiniQuoteAdapter } from '@app/features/privacy/providers/houdini/utils/houdini-quote-adapter';
import { PrivateSwapEvent } from '@app/features/privacy/providers/shared-privacy-providers/models/private-event';
import { PrivatePageTypeService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-page-type/private-page-type.service';
import { FromAssetsService } from '@app/features/trade/components/assets-selector/services/from-assets.service';
import { ToAssetsService } from '@app/features/trade/components/assets-selector/services/to-assets.service';
import { TokenAmount } from '@cryptorubic/core';
import { InsufficientFundsError, RubicSdkError } from '@cryptorubic/web3';
import {
  defer,
  filter,
  first,
  firstValueFrom,
  lastValueFrom,
  retry,
  startWith,
  takeUntil,
  tap,
  throwError,
  timer
} from 'rxjs';
import { HoudiniErrorService } from '../../services/houdini-error.service';
import { HoudiniPrivateActionButtonService } from '../../services/houdini-private-action-button.service';
import { PrivateActionButtonService } from '../../../shared-privacy-providers/services/private-action-button/private-action-button.service';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import { houdiniFormConfig } from '../../constants/form-config';
import { FormControl } from '@angular/forms';
import { PrivateQueryParamsService } from '../../../shared-privacy-providers/services/query-params/private-query-params.service';
import { List } from 'immutable';
import { getEmptySwapFormInput } from '@app/features/privacy/utils/empty-swap-form-input';
import { SdkLegacyService } from '@app/core/services/sdk/sdk-legacy/sdk-legacy.service';
import { AuthService } from '@app/core/services/auth/auth.service';
import { ErrorsService } from '@app/core/errors/errors.service';
import { RubicError } from '@app/core/errors/models/rubic-error';
import { RubicAny } from '@app/shared/models/utility-types/rubic-any';

@Component({
  selector: 'app-houdini-main-page',
  templateUrl: './houdini-main-page.component.html',
  styleUrls: ['./houdini-main-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: FromAssetsService, useClass: HoudiniPrivateAssetsService },
    { provide: ToAssetsService, useClass: HoudiniPrivateAssetsService },
    { provide: TokensFacadeService, useClass: HoudiniTokensFacadeService },
    { provide: PrivateActionButtonService, useClass: HoudiniPrivateActionButtonService }
  ]
})
export class HoudiniMainPageComponent implements OnInit, OnDestroy {
  public readonly receiverCtrl = new FormControl<string>('');

  public readonly quoteAdapter = new HoudiniQuoteAdapter(
    this.houdiniSwapService,
    this.receiverCtrl,
    this.houdiniErrorService,
    this.notificationsService
  );

  public readonly formConfig = houdiniFormConfig;

  public readonly depositTradeData$ = this.houdiniSwapService.depositTradeData$;

  public readonly depositTradeStatus$ = this.houdiniSwapService.depositTradeStatus$;

  public readonly requireReceiverAddress$ = this.houdiniSwapService.requireReceiverAddress$;

  constructor(
    private readonly houdiniSwapService: HoudiniSwapService,
    private readonly privatePageTypeService: PrivatePageTypeService,
    private readonly houdiniErrorService: HoudiniErrorService,
    private readonly privateActionButtonService: PrivateActionButtonService,
    private readonly notificationsService: NotificationsService,
    private readonly houdiniTokensFacade: HoudiniTokensFacadeService,
    private readonly privateQueryParamsService: PrivateQueryParamsService,
    private readonly sdkLegacyService: SdkLegacyService,
    private readonly authService: AuthService,
    private readonly errorService: ErrorsService
  ) {
    this.privatePageTypeService.activePage = {
      type: 'swap',
      label: 'Swap'
    };
  }

  ngOnInit(): void {
    this.parseQueryParams();
    this.receiverCtrl.valueChanges
      .pipe(
        startWith(this.receiverCtrl.value),
        tap(address => {
          this.privateActionButtonService.setReceiverAddress(address);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();

    this.houdiniSwapService.subscribeOnFormUpdate(this.receiverCtrl);
  }

  ngOnDestroy(): void {
    this.houdiniSwapService.resetCurrentTrade();
    this.houdiniSwapService.subscriptions.forEach(s => s?.unsubscribe());
  }

  public async swap({ swapInfo, loadingCallback, openPreview }: PrivateSwapEvent): Promise<void> {
    try {
      const fromToken = new TokenAmount({
        ...swapInfo.fromAsset,
        tokenAmount: swapInfo.fromAmount.actualValue
      });

      const chainAdapter = this.sdkLegacyService.adaptersFactoryService.getAdapter(
        fromToken.blockchain as RubicAny
      );

      const isEnoughBalance = await lastValueFrom(
        defer(() => chainAdapter.checkEnoughBalance(fromToken, this.authService.userAddress)).pipe(
          retry({
            count: 5,
            delay: (error, retryCount) => {
              console.error('check balance error:', error, 'retry #', retryCount);
              if (error?.message?.includes('Request failed with status code 429')) {
                return timer(5000);
              }
              return throwError(() => error);
            }
          })
        )
      );
      if (!isEnoughBalance) {
        throw new InsufficientFundsError(fromToken.symbol);
      }

      const currentTrade = this.houdiniSwapService.currentTrade;
      const preview$ = openPreview({
        steps: [
          {
            label: 'Swap',
            action: () => this.houdiniSwapService.swap(fromToken, this.receiverCtrl.value)
          }
        ],
        hideFeeInfo: true,
        srcTokenAmount: fromToken.tokenAmount.toFixed(),
        dstTokenAmount: currentTrade.to.tokenAmount.toFixed()
      });
      await firstValueFrom(preview$);
    } catch (error) {
      if (error instanceof RubicError || error instanceof RubicSdkError) {
        this.errorService.catch(error);
      } else {
        this.notificationsService.showError('Something went wrong. Please, try again later.');
      }
    } finally {
      loadingCallback();
    }
  }

  private parseQueryParams(): void {
    this.houdiniTokensFacade
      .getTokensList('allChains', '', 'from', getEmptySwapFormInput())
      .pipe(
        filter(tokens => tokens.length > 0),
        first()
      )
      .subscribe(supportedTokens => {
        this.privateQueryParamsService.parseMainSwapInfoAndQueryParams(List(supportedTokens));
      });
  }

  readonly destroyRef = inject(DestroyRef);
}
