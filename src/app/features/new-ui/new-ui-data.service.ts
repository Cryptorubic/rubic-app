import { Injectable } from '@angular/core';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import BigNumber from 'bignumber.js';
import { INSTANT_TRADES_STATUS } from 'src/app/features/swaps-page-old/instant-trades/models/instant-trades-trade-status';
import { PROVIDERS } from 'src/app/features/swaps-page-old/instant-trades/models/providers.enum';
import { ProviderControllerData } from 'src/app/shared/components/provider-panel/provider-panel.component';
import InstantTrade from 'src/app/features/swaps-page-old/instant-trades/models/InstantTrade';
import { BlockchainToken } from 'src/app/shared/models/tokens/BlockchainToken';

@Injectable({
  providedIn: 'root'
})
export class NewUiDataService {
  public providerControllers: ProviderControllerData[];

  public instantTrade: InstantTrade;

  public instantTradeTokens: BlockchainToken[];

  public defaultITToken: BlockchainToken;

  public defaultProvider: any;

  constructor() {
    this.defaultITToken = {
      blockchain: BLOCKCHAIN_NAME.ETHEREUM,
      address: '0x8e3bcc334657560253b83f08331d85267316e08a',
      name: 'rubic',
      symbol: 'BRBC',
      decimals: 18
    };
    this.instantTradeTokens = [this.defaultITToken, this.defaultITToken, this.defaultITToken];
    this.instantTrade = {
      from: {
        token: this.instantTradeTokens[0],
        amount: new BigNumber(1)
      },
      to: {
        token: this.instantTradeTokens[1],
        amount: new BigNumber('2.512408')
      },
      estimatedGas: new BigNumber('33.91408'),
      gasFeeInUsd: new BigNumber('23.4'),
      gasFeeInEth: new BigNumber('0.005')
    };
    this.defaultProvider = {
      trade: this.instantTrade,
      tradeState: INSTANT_TRADES_STATUS.COMPLETED,
      tradeProviderInfo: {
        label: '1inch',
        value: PROVIDERS.ONEINCH
      },
      isBestRate: false,
      isSelected: false
    };
    this.providerControllers = [
      this.defaultProvider,
      {
        ...this.defaultProvider,
        tradeState: INSTANT_TRADES_STATUS.TX_IN_PROGRESS
      },
      {
        ...this.defaultProvider,
        isBestRate: true
      }
    ];
  }

  public selectProvider(providerNumber: number): void {
    const newProviders = this.providerControllers.map(provider => {
      return {
        ...provider,
        isSelected: false
      };
    });
    newProviders[providerNumber] = {
      ...newProviders[providerNumber],
      isSelected: true
    };
    this.providerControllers = newProviders;
  }
}
