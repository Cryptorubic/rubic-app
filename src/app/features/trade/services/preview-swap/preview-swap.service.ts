import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, forkJoin, Observable, of } from 'rxjs';
import { TransactionStep } from '@features/trade/models/transaction-steps';
import { first, map, switchMap } from 'rxjs/operators';
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
    private readonly swapsControllerService: SwapsControllerService
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
              return this.swapsControllerService.swap(tradeState, {
                onHash: (_hash: string) => {
                  this._transactionState$.next('sourcePending');
                },
                onSwap: () => {
                  if (tradeState.trade instanceof CrossChainTrade) {
                    this._transactionState$.next('destinationPending');
                    setTimeout(() => {
                      this._transactionState$.next('success');
                      this._formState$.next('complete');
                    }, 60_000);
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
}
