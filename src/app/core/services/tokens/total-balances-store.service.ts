import { Injectable, inject } from '@angular/core';
import { WalletChainType } from '@app/core/header/components/header/components/user-profile-wallets/constants/wallets-chain-types';
import BigNumber from 'bignumber.js';
import { BehaviorSubject, interval } from 'rxjs';
import { NewTokensStoreService } from './new-tokens-store.service';
import { BlockchainName, BlockchainsInfo } from '@cryptorubic/core';

@Injectable({
  providedIn: 'root'
})
export class TotalBalancesStoreService {
  private readonly tokensStoreService = inject(NewTokensStoreService);

  private readonly _totalBalancesUsd$ = new BehaviorSubject<Record<WalletChainType, BigNumber>>({
    BITCOIN: new BigNumber(0),
    EVM: new BigNumber(0),
    SOLANA: new BigNumber(0),
    STELLAR: new BigNumber(0),
    SUI: new BigNumber(0),
    TON: new BigNumber(0),
    TRON: new BigNumber(0)
  });

  public readonly totalBalancesUsd$ = this._totalBalancesUsd$.asObservable();

  public get totalBalancesUsd(): Record<WalletChainType, BigNumber> {
    return this._totalBalancesUsd$.value;
  }

  public runUpdateBalancesInterval(): void {
    interval(30_000).subscribe(() => this.calculateAllTotalBalances());
  }

  /**
   * when opened -> calculate all balance in bg,
   * every 30 secs -> recalculate it in bg
   */

  public calculateAllTotalBalances(): void {
    const balances = {
      BITCOIN: new BigNumber(0),
      EVM: new BigNumber(0),
      SOLANA: new BigNumber(0),
      STELLAR: new BigNumber(0),
      SUI: new BigNumber(0),
      TON: new BigNumber(0),
      TRON: new BigNumber(0)
    };
    const walletChainTypes = Object.keys(balances);

    for (const key in this.tokensStoreService.tokens) {
      const blockchain = key as BlockchainName;
      const chainType = BlockchainsInfo.getChainType(blockchain);
      const isSupportedChainType = walletChainTypes.some(
        walletChainType => walletChainType === chainType
      );
      if (isSupportedChainType) {
        const chainTokensMap = this.tokensStoreService.tokens[blockchain].getTokens();
        const chainTokensArray = Object.values(chainTokensMap);
        chainTokensArray.forEach(token => {
          if (token.price && token.price > 0 && token.amount && token.amount.isPositive()) {
            const storedUsdAmount = balances[chainType as WalletChainType];
            const usdAmount = token.amount.multipliedBy(token.price);
            balances[chainType as WalletChainType] = storedUsdAmount.plus(usdAmount);
          }
        });
      }
    }

    this._totalBalancesUsd$.next(balances);
  }

  public calculateTotalBalanceByChain(chainTypeToUpdate: WalletChainType): void {
    const balances = this.totalBalancesUsd;
    balances[chainTypeToUpdate] = new BigNumber(0);

    for (const key in this.tokensStoreService.tokens) {
      const blockchain = key as BlockchainName;
      const chainType = BlockchainsInfo.getChainType(blockchain);
      if (chainType === chainTypeToUpdate) {
        const chainTokensMap = this.tokensStoreService.tokens[blockchain].getTokens();
        const chainTokensArray = Object.values(chainTokensMap);
        chainTokensArray.forEach(token => {
          if (token.price && token.price > 0 && token.amount && token.amount.isPositive()) {
            const storedUsdAmount = balances[chainType as WalletChainType];
            const usdAmount = token.amount.multipliedBy(token.price);
            balances[chainType as WalletChainType] = storedUsdAmount.plus(usdAmount);
          }
        });
      }
    }

    this._totalBalancesUsd$.next(balances);
  }

  public clearTotalBalanceByChain(chainType: WalletChainType): void {
    this._totalBalancesUsd$.next({ ...this.totalBalancesUsd, [chainType]: new BigNumber(0) });
  }
}
