import { Injectable } from '@angular/core';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import BigNumber from 'bignumber.js';
import { INSTANT_TRADES_STATUS } from 'src/app/features/swaps-page-old/instant-trades/models/instant-trades-trade-status';
import { PROVIDERS } from 'src/app/features/swaps-page-old/instant-trades/models/providers.enum';
import { ProviderControllerData } from 'src/app/shared/components/provider-panel/provider-panel.component';
import InstantTrade from 'src/app/features/swaps-page-old/instant-trades/models/InstantTrade';
import { BlockchainToken } from 'src/app/shared/models/tokens/BlockchainToken';
import { AvailableTokenAmount } from '../../shared/models/tokens/AvailableTokenAmount';

@Injectable({
  providedIn: 'root'
})
export class NewUiDataService {
  public providerControllers: ProviderControllerData[];

  public instantTrade: InstantTrade;

  public instantTradeTokens: BlockchainToken[];

  public defaultITToken: BlockchainToken;

  public defaultProvider: any;

  public tokens: AvailableTokenAmount[] = [
    {
      image: 'http://api.rubic.exchange/media/token_images/cg_logo_ETH_ethereum_UjtINYs.png',
      rank: 1,
      price: 2600,
      usedInIframe: true,
      blockchain: BLOCKCHAIN_NAME.ETHEREUM,
      address: '0x0000000000000000000000000000000000000000',
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
      amount: new BigNumber(12345678999999.23456),
      available: true
    },
    {
      image: 'http://api.rubic.exchange/media/token_images/RBC_logo_new_I8eqPBM.png',
      rank: 0.5,
      price: 200,
      usedInIframe: true,
      blockchain: BLOCKCHAIN_NAME.ETHEREUM,
      address: '0x1000000000000000000000000000000000000000',
      name: 'Weenus',
      symbol: 'WEENUS',
      decimals: 18,
      amount: new BigNumber(123456789.123456),
      available: false
    },
    {
      image: 'http://api.rubic.exchange/media/token_images/cg_logo_USDT_Tether-logo_gx5smb6.png',
      rank: 0.4,
      price: 200,
      usedInIframe: true,
      blockchain: BLOCKCHAIN_NAME.ETHEREUM,
      address: '0x2000000000000000000000000000000000000000',
      name: 'DaiToken',
      symbol: 'DAI',
      decimals: 18,
      amount: new BigNumber(123456789999.123456),
      available: true
    },
    {
      image:
        'https://raw.githubusercontent.com/MyWishPlatform/etherscan_top_tokens_images/master/fa-empire.png',
      rank: 0.3,
      price: 200,
      usedInIframe: true,
      blockchain: BLOCKCHAIN_NAME.ETHEREUM,
      address: '0x3000000000000000000000000000000000000000',
      name: 'noname',
      symbol: 'USDT',
      decimals: 18,
      amount: new BigNumber(1234567899998.1234),
      available: false
    },
    {
      image: 'http://api.rubic.exchange/media/token_images/cg_logo_ETH_ethereum_UjtINYs.png',
      rank: 1,
      price: 2600,
      usedInIframe: true,
      blockchain: BLOCKCHAIN_NAME.ETHEREUM,
      address: '0x4000000000000000000000000000000000000000',
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
      amount: new BigNumber(12345678999999.23456),
      available: false
    },
    {
      image: 'http://api.rubic.exchange/media/token_images/RBC_logo_new_I8eqPBM.png',
      rank: 0.5,
      price: 200,
      usedInIframe: true,
      blockchain: BLOCKCHAIN_NAME.ETHEREUM,
      address: '0x5000000000000000000000000000000000000000',
      name: 'Weenus',
      symbol: 'WEENUS',
      decimals: 18,
      amount: new BigNumber(123456789.123456),
      available: false
    },
    {
      image: 'http://api.rubic.exchange/media/token_images/cg_logo_USDT_Tether-logo_gx5smb6.png',
      rank: 0.4,
      price: 200,
      usedInIframe: true,
      blockchain: BLOCKCHAIN_NAME.ETHEREUM,
      address: '0x6000000000000000000000000000000000000000',
      name: 'DaiToken',
      symbol: 'DAI',
      decimals: 18,
      amount: new BigNumber(123456789999.123456),
      available: true
    },
    {
      image:
        'https://raw.githubusercontent.com/MyWishPlatform/etherscan_top_tokens_images/master/fa-empire.png',
      rank: 0.3,
      price: 200,
      usedInIframe: true,
      blockchain: BLOCKCHAIN_NAME.ETHEREUM,
      address: '0x7000000000000000000000000000000000000000',
      name: 'noname',
      symbol: 'USDT',
      decimals: 18,
      amount: new BigNumber(1234567899998.1234),
      available: true
    },
    {
      image: 'http://api.rubic.exchange/media/token_images/cg_logo_ETH_ethereum_UjtINYs.png',
      rank: 1,
      price: 2600,
      usedInIframe: true,
      blockchain: BLOCKCHAIN_NAME.ETHEREUM,
      address: '0x1100000000000000000000000000000000000000',
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
      amount: new BigNumber(12345678999999.23456),
      available: true
    },
    {
      image: 'http://api.rubic.exchange/media/token_images/RBC_logo_new_I8eqPBM.png',
      rank: 0.5,
      price: 200,
      usedInIframe: true,
      blockchain: BLOCKCHAIN_NAME.ETHEREUM,
      address: '0x1200000000000000000000000000000000000000',
      name: 'Weenus',
      symbol: 'WEENUS',
      decimals: 18,
      amount: new BigNumber(123456789.123456),
      available: true
    },
    {
      image: 'http://api.rubic.exchange/media/token_images/cg_logo_USDT_Tether-logo_gx5smb6.png',
      rank: 0.4,
      price: 200,
      usedInIframe: true,
      blockchain: BLOCKCHAIN_NAME.ETHEREUM,
      address: '0x1300000000000000000000000000000000000000',
      name: 'DaiToken',
      symbol: 'DAI',
      decimals: 18,
      amount: new BigNumber(123456789999.123456),
      available: true
    },
    {
      image:
        'https://raw.githubusercontent.com/MyWishPlatform/etherscan_top_tokens_images/master/fa-empire.png',
      rank: 0.3,
      price: 200,
      usedInIframe: true,
      blockchain: BLOCKCHAIN_NAME.ETHEREUM,
      address: '0x1400000000000000000000000000000000000000',
      name: 'noname',
      symbol: 'USDT',
      decimals: 18,
      amount: new BigNumber(1234567899998.1234),
      available: true
    },
    {
      image:
        'http://api.rubic.exchange/media/token_images/cg_logo_bnb_binance-coin-logo_ij3DxE0.png',
      rank: 0.5,
      price: 200,
      usedInIframe: true,
      blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
      address: '0x8000000000000000000000000000000000000000',
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
      amount: new BigNumber(0),
      available: true
    },
    {
      image: 'http://api.rubic.exchange/media/token_images/MATIC_logo.webp',
      rank: 0.5,
      price: 200,
      usedInIframe: true,
      blockchain: BLOCKCHAIN_NAME.POLYGON,
      address: '0x9000000000000000000000000000000000000000',
      name: 'Matic',
      symbol: 'MATIC',
      decimals: 18,
      amount: new BigNumber(123456.1234),
      available: true
    }
  ];

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
