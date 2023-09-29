import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, forkJoin, from, interval, Observable, of } from 'rxjs';
import { TransactionStep } from '@features/trade/models/transaction-steps';
import { first, map, startWith, switchMap, takeWhile, tap } from 'rxjs/operators';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { AssetSelector } from '@shared/models/asset-selector';
import { BLOCKCHAINS } from '@shared/constants/blockchain/ui-blockchains';
import { blockchainColor } from '@shared/constants/blockchain/blockchain-color';
import { SelectedTrade } from '@features/trade/models/selected-trade';
import { SwapsStateService } from '@features/trade/services/swaps-state/swaps-state.service';
import { SwapsControllerService } from '@features/trade/services/swaps-controller/swaps-controller.service';
import { CrossChainTrade } from 'rubic-sdk/lib/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';
import BigNumber from 'bignumber.js';
import { CrossChainTradeType, TX_STATUS, Web3PublicSupportedBlockchain } from 'rubic-sdk';
import { SdkService } from '@core/services/sdk/sdk.service';

interface TokenFiatAmount {
  tokenAmount: BigNumber;
  fiatAmount: string;
}

interface TradeInfo {
  fromAsset: AssetSelector;
  fromValue: TokenFiatAmount;
  toAsset: AssetSelector;
  toValue: TokenFiatAmount;
}

@Injectable()
export class PreviewSwapService {
  private readonly _formState$ = new BehaviorSubject<'preview' | 'process' | 'complete'>('preview');

  public readonly formState$ = this._formState$.asObservable();

  private readonly _transactionState$ = new BehaviorSubject<TransactionStep>('idle');

  public readonly transactionState$ = this._transactionState$.asObservable();

  public readonly tradeState$: Observable<SelectedTrade> = this.swapsStateService.tradeState$.pipe(
    first()
  );

  public tradeInfo$: Observable<TradeInfo> = forkJoin([
    this.swapForm.fromToken$.pipe(first()),
    this.swapForm.fromAmount$.pipe(first()),
    this.swapForm.toToken$.pipe(first()),
    this.swapForm.toAmount$.pipe(first())
  ]).pipe(
    map(([fromToken, fromAmount, toToken, toAmount]) => {
      const fromAsset = this.getTokenAsset(fromToken);
      const fromValue = {
        tokenAmount: fromAmount,
        fiatAmount:
          fromAmount.gt(0) && fromToken.price
            ? fromAmount.multipliedBy(fromToken.price || 0).toFixed(2)
            : null
      };

      const toAsset = this.getTokenAsset(toToken);
      const toValue = {
        tokenAmount: toAmount,
        fiatAmount:
          toAmount.gt(0) && toToken.price
            ? toAmount.multipliedBy(toToken.price || 0).toFixed(2)
            : null
      };

      return { fromAsset, fromValue, toAsset, toValue };
    })
  );

  constructor(
    private readonly swapsStateService: SwapsStateService,
    private readonly swapForm: SwapsFormService,
    private readonly swapsControllerService: SwapsControllerService,
    private readonly sdkService: SdkService
  ) {
    this.handleTransactionState();
  }

  private getTokenAsset(token: TokenAmount): AssetSelector {
    const blockchain = BLOCKCHAINS[token.blockchain];
    const color = blockchainColor[token.blockchain];

    return {
      secondImage: blockchain.img,
      secondLabel: blockchain.name,
      mainImage: token.image,
      mainLabel: token.symbol,
      secondColor: color
    };
  }

  public setNextTxState(state: TransactionStep): void {
    this._transactionState$.next(state);
  }

  public async requestTxSign(): Promise<void> {
    this._formState$.next('process');
    const tradeState = await firstValueFrom(this.tradeState$);

    if (tradeState.needApprove) {
      this.startApprove();
    } else {
      this.startSwap();
    }
  }

  public startSwap(): void {
    this._transactionState$.next('swapRequest');
  }

  public startApprove(): void {
    this._transactionState$.next('approveRequest');
  }

  public handleTransactionSign(): void {}

  private handleTransactionState(): void {
    this.transactionState$
      .pipe(
        switchMap(state => forkJoin([this.tradeState$, of(state)])),
        switchMap(([tradeState, txState]) => {
          switch (txState) {
            case 'approveRequest': {
              return this.swapsControllerService.approve(tradeState, {
                onHash: (_hash: string) => {
                  this._transactionState$.next('approvePending');
                },
                onSwap: () => {
                  this._transactionState$.next('swapRequest');
                },
                onError: () => {
                  this._transactionState$.next('approveReady');
                }
              });
            }
            case 'swapRequest': {
              let txHash: string;
              return this.swapsControllerService.swap(tradeState, {
                onHash: (hash: string) => {
                  txHash = hash;
                  this._transactionState$.next('sourcePending');
                },
                onSwap: () => {
                  if (tradeState.trade instanceof CrossChainTrade) {
                    this._transactionState$.next('destinationPending');
                    this.initDstTxStatusPolling(txHash, Date.now());
                  } else {
                    this._transactionState$.next('success');
                  }

                  // @TODO
                },
                onError: () => {
                  this._transactionState$.next('swapReady');
                }
              });
            }
            default: {
              return of(null);
            }
          }
        })
      )
      .subscribe();
  }

  public initDstTxStatusPolling(srcHash: string, timestamp: number): void {
    interval(30_000)
      .pipe(
        startWith(-1),
        switchMap(() => this.tradeState$),
        switchMap(tradeState => {
          const amount =
            'price' in tradeState.trade.toTokenAmountMin
              ? tradeState.trade.toTokenAmountMin.tokenAmount
              : tradeState.trade.toTokenAmountMin;
          return from(
            this.sdkService.crossChainStatusManager.getCrossChainStatus(
              {
                fromBlockchain: tradeState.trade.from.blockchain as Web3PublicSupportedBlockchain,
                toBlockchain: tradeState.trade.to.blockchain,
                srcTxHash: srcHash,
                txTimestamp: timestamp,
                amountOutMin: amount.toFixed()
              },
              tradeState.tradeType as CrossChainTradeType
            )
          );
        }),
        tap(crossChainStatus => {
          if (crossChainStatus.dstTxStatus === TX_STATUS.SUCCESS) {
            this._transactionState$.next('success');
            this._formState$.next('complete');
          } else if (crossChainStatus.dstTxStatus === TX_STATUS.FAIL) {
            this._transactionState$.next('error');
            this._formState$.next('complete');
          }
        }),
        takeWhile(crossChainStatus => crossChainStatus.dstTxStatus === TX_STATUS.PENDING)
      )
      .subscribe();
  }
}
