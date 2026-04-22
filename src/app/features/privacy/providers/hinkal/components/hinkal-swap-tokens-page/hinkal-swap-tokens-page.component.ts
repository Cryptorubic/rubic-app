import { ChangeDetectionStrategy, Component, Self } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PrivateSwapEvent } from '../../../shared-privacy-providers/models/private-event';
import { HinkalQuoteAdapter } from '../../services/hinkal-sdk/utils/hinkal-quote-adapter';
import {
  BlockchainsInfo,
  compareAddresses,
  EvmBlockchainName,
  Token,
  TokenAmount
} from '@cryptorubic/core';
import { HinkalFacadeService } from '../../services/hinkal-sdk/hinkal-facade.service';
import { BehaviorSubject, firstValueFrom, map, startWith, takeUntil, tap } from 'rxjs';
import { HinkalPrivateAssetsService } from '../../services/hinkal-private-assets.service';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { HINKAL_WARNINGS } from '../../constants/hinkal-preswap-warnings';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { PrivateActionButtonService } from '../../../shared-privacy-providers/services/private-action-button/private-action-button.service';
import { FromAssetsService } from '@app/features/trade/components/assets-selector/services/from-assets.service';
import { HinkalWorkerService } from '../../services/hinkal-sdk/hinkal-worker.service';
import { ToAssetsService } from '@app/features/trade/components/assets-selector/services/to-assets.service';
import { HINKAL_DEFAULT_CREATION_CONFIG } from '../../constants/hinkal-default-creation-config';
import { HinkalToPrivateAssetsService } from '../../services/hinkal-to-assets.service';
import { HinkalBalanceService } from '../../services/hinkal-sdk/hinkal-balance.service';
import { PrivateSwapWindowService } from '../../../shared-privacy-providers/services/private-swap-window/private-swap-window.service';
import BigNumber from 'bignumber.js';
import { HinkalSwapTokensFacadeService } from '../../services/token-facades/hinkal-swap-tokens-facade.service';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';

@Component({
  selector: 'app-hinkal-swap-tokens-page',
  templateUrl: './hinkal-swap-tokens-page.component.html',
  styleUrls: ['./hinkal-swap-tokens-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    TuiDestroyService,
    { provide: FromAssetsService, useClass: HinkalPrivateAssetsService },
    { provide: ToAssetsService, useClass: HinkalToPrivateAssetsService },

    { provide: TokensFacadeService, useClass: HinkalSwapTokensFacadeService }
  ]
})
export class HinkalSwapTokensPageComponent {
  public readonly receiverCtrl = new FormControl<string>('');

  public readonly creationConfig$ = this.hinkalFacadeService.activeChain$.pipe(
    map(chain => {
      return {
        ...HINKAL_DEFAULT_CREATION_CONFIG,
        assetsSelectorConfig: {
          ...HINKAL_DEFAULT_CREATION_CONFIG.assetsSelectorConfig,
          listType: chain,
          platformLoading$: this.hinkalFacadeService.balanceLoading$
        }
      };
    })
  );

  private readonly _availableGasTokens$ = new BehaviorSubject<BalanceToken[]>([]);

  public get availableGasTokens(): BalanceToken[] {
    return this._availableGasTokens$?.value;
  }

  constructor(
    private readonly workerService: HinkalWorkerService,
    private readonly hinkalFacadeService: HinkalFacadeService,
    private readonly notificationsService: NotificationsService,
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly privateActionButtonService: PrivateActionButtonService,
    private readonly hinkalBalanceService: HinkalBalanceService,
    private readonly privateSwapWindowService: PrivateSwapWindowService,
    private readonly fromAssetsService: FromAssetsService,
    private readonly toAssetsService: ToAssetsService,
    private readonly tokensFacadeService: TokensFacadeService
  ) {}

  ngOnInit(): void {
    this.receiverCtrl.valueChanges
      .pipe(
        startWith(this.receiverCtrl.value),
        tap(address => {
          this.privateActionButtonService.setReceiverAddress(address);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();

    this.fromAssetsService.assetListType$.pipe(takeUntil(this.destroy$)).subscribe(asset => {
      const isFromChain = BlockchainsInfo.isBlockchainName(asset);
      const isToChain = BlockchainsInfo.isBlockchainName(this.toAssetsService.assetListType);

      if (isFromChain && isToChain && asset !== this.toAssetsService.assetListType) {
        this.privateSwapWindowService.patchSwapInfo({ toAsset: null });
      }
    });

    this.toAssetsService.assetListType$.pipe(takeUntil(this.destroy$)).subscribe(asset => {
      const isToChain = BlockchainsInfo.isBlockchainName(asset);
      const isFromChain = BlockchainsInfo.isBlockchainName(this.fromAssetsService.assetListType);

      if (isFromChain && isToChain && asset !== this.fromAssetsService.assetListType) {
        this.privateSwapWindowService.patchSwapInfo({ fromAsset: null });
      }
    });

    this.subscribeOnPrivateBalanceChanges();
  }

  private subscribeOnPrivateBalanceChanges(): void {
    const tokens = this.tokensFacadeService.tokens;

    this.hinkalBalanceService.balances$
      .pipe(takeUntil(this.destroy$))
      .subscribe(shieldedBalances => {
        const swapInfo = this.privateSwapWindowService.swapInfo;

        if (swapInfo.fromAsset) {
          const balances = shieldedBalances[swapInfo.fromAsset.blockchain as EvmBlockchainName];
          const tokenBalance = balances?.find(balance =>
            compareAddresses(balance?.tokenAddress, swapInfo.fromAsset.address)
          );

          this.privateSwapWindowService.patchSwapInfo({
            fromAsset: {
              ...swapInfo.fromAsset,
              amount: tokenBalance
                ? Token.fromWei(tokenBalance.amount, swapInfo.fromAsset.decimals)
                : new BigNumber(0)
            }
          });

          const availableGasTokens = balances?.map(
            balance =>
              ({
                ...tokens.find(
                  token =>
                    token.blockchain === swapInfo.fromAsset?.blockchain &&
                    compareAddresses(token.address, balance.tokenAddress)
                ),
                amount: balance.amount
              } as BalanceToken)
          );
          this._availableGasTokens$.next(availableGasTokens ?? []);
        }
      });
  }

  public readonly quoteAdapter = new HinkalQuoteAdapter(
    this.workerService,
    this.notificationsService
  );

  public async handleSwap({
    swapInfo,
    loadingCallback,
    openPreview
  }: PrivateSwapEvent): Promise<void> {
    try {
      const fromToken = new TokenAmount({
        ...swapInfo.fromAsset,
        weiAmount: Token.toWei(swapInfo.fromAmount.actualValue, swapInfo.fromAsset.decimals)
      }) as TokenAmount<EvmBlockchainName>;

      const toToken = new TokenAmount({
        ...swapInfo.toAsset,
        weiAmount: Token.toWei(swapInfo.toAmount.actualValue, swapInfo.toAsset.decimals)
      }) as TokenAmount<EvmBlockchainName>;

      const steps = this.hinkalFacadeService.prepareSwapSteps(
        fromToken,
        toToken,
        () => this.privateSwapWindowService.selectedGasToken ?? undefined
      );

      const gasTokens = await this.hinkalFacadeService.prepareGasTokens(
        fromToken,
        toToken,
        this.availableGasTokens
      );

      // //FOR TESTS ONLY
      // const gasTokens: GasToken[] = [
      //   {
      //     blockchain: BLOCKCHAIN_NAME.ETHEREUM,
      //     address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      //     name: 'Wrapped Ether',
      //     symbol: 'WETH',
      //     decimals: 18,
      //     price: 3142.57,
      //     amount: new BigNumber(1.5),
      //     favorite: false,
      //     image: '',
      //     rank: 0,
      //     gasFee: new BigNumber(0.5),
      //     gasFeeUsd: new BigNumber(1)
      //   },
      //   {
      //     blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
      //     address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
      //     name: 'Binance USD',
      //     symbol: 'BUSD',
      //     decimals: 18,
      //     price: 1.0,
      //     amount: new BigNumber(500),
      //     favorite: false,
      //     image: '',
      //     rank: 0,
      //     gasFee: new BigNumber(0.5),
      //     gasFeeUsd: new BigNumber(1)
      //   },
      //   {
      //     blockchain: BLOCKCHAIN_NAME.POLYGON,
      //     address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      //     name: 'USD Coin',
      //     symbol: 'USDC',
      //     decimals: 6,
      //     price: 0.9998,
      //     amount: new BigNumber(250.75),
      //     favorite: false,
      //     image: '',
      //     rank: 0,
      //     gasFee: new BigNumber(0.5),
      //     gasFeeUsd: new BigNumber(1)
      //   },
      //   {
      //     blockchain: BLOCKCHAIN_NAME.AVALANCHE,
      //     address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
      //     name: 'Avalanche',
      //     symbol: 'AVAX',
      //     decimals: 18,
      //     price: 38.44,
      //     amount: new BigNumber(12.3),
      //     favorite: false,
      //     image: '',
      //     rank: 0,
      //     gasFee: new BigNumber(0.5),
      //     gasFeeUsd: new BigNumber(1)
      //   },
      //   {
      //     blockchain: BLOCKCHAIN_NAME.ARBITRUM,
      //     address: '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a',
      //     name: 'GMX',
      //     symbol: 'GMX',
      //     decimals: 18,
      //     price: 27.91,
      //     amount: new BigNumber(8.0),
      //     favorite: false,
      //     image: '',
      //     rank: 0,
      //     gasFee: new BigNumber(0.5),
      //     gasFeeUsd: new BigNumber(1)
      //   },
      //   {
      //     blockchain: BLOCKCHAIN_NAME.SOLANA,
      //     address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      //     name: 'USD Coin',
      //     symbol: 'USDC',
      //     decimals: 6,
      //     price: 1.0001,
      //     amount: new BigNumber(1000),
      //     favorite: false,
      //     image: '',
      //     rank: 0,
      //     gasFee: new BigNumber(0.5),
      //     gasFeeUsd: new BigNumber(1)
      //   },
      //   {
      //     blockchain: BLOCKCHAIN_NAME.OPTIMISM,
      //     address: '0x4200000000000000000000000000000000000042',
      //     name: 'Optimism',
      //     symbol: 'OP',
      //     decimals: 18,
      //     price: 1.73,
      //     amount: new BigNumber(45.5),
      //     favorite: false,
      //     image: '',
      //     rank: 0,
      //     gasFee: new BigNumber(0.5),
      //     gasFeeUsd: new BigNumber(1)
      //   }
      // ];

      const preview$ = openPreview({
        steps,
        warnings: HINKAL_WARNINGS,
        gasTokens
      });

      await firstValueFrom(preview$);
    } finally {
      loadingCallback();
    }
  }
}
