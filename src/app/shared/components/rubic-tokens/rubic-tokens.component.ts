import { Component, Input } from '@angular/core';
import { IToken } from 'src/app/shared/models/tokens/IToken';
import { TokensSelectService } from 'src/app/features/tokens-select/services/tokens-select.service';
import BigNumber from 'bignumber.js';
import { of } from 'rxjs';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';
import ADDRESS_TYPE from 'src/app/shared/models/blockchain/ADDRESS_TYPE';
import { AvailableTokenAmount } from '../../models/tokens/AvailableTokenAmount';
import { BLOCKCHAIN_NAME } from '../../models/blockchain/BLOCKCHAIN_NAME';

@Component({
  selector: 'app-rubic-tokens',
  templateUrl: './rubic-tokens.component.html',
  styleUrls: ['./rubic-tokens.component.scss']
})
export class RubicTokensComponent {
  @Input() loading: boolean;

  @Input() tokenType: 'from' | 'to';

  @Input() tokens: AvailableTokenAmount[];

  public ADDRESS_TYPE = ADDRESS_TYPE;

  public selectedToken: IToken;

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public testTokens: AvailableTokenAmount[] = [
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
      image: '',
      rank: 1,
      price: 2500,
      usedInIframe: true,
      blockchain: BLOCKCHAIN_NAME.ETHEREUM,
      address: '0xa4eed63db85311e22df4473f87ccfc3dadcfa3e3',
      name: 'Rubic',
      symbol: 'RBC',
      decimals: 18,
      amount: new BigNumber(1234.412),
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

  constructor(
    private tokensSelectService: TokensSelectService,
    private readonly swapFormService: SwapFormService
  ) {
    this.swapFormService.commonTrade.controls.input.valueChanges.subscribe(formValue => {
      const formKey = this.tokenType === 'from' ? 'fromToken' : 'toToken';
      this.selectedToken = formValue[formKey];
    });
  }

  openTokensSelect() {
    const { fromBlockchain, toBlockchain } = this.swapFormService.commonTrade.controls.input.value;
    const enabledCustomTokenBlockchain = this.tokenType === 'from' ? toBlockchain : fromBlockchain;

    this.tokensSelectService
      .showDialog(of(this.tokens), enabledCustomTokenBlockchain)
      .subscribe((token: IToken) => {
        if (token) {
          this.selectedToken = token;
          if (this.tokenType === 'from') {
            this.swapFormService.commonTrade.controls.input.patchValue({
              fromBlockchain: token.blockchain
            });
            this.swapFormService.commonTrade.controls.input.patchValue({
              fromToken: token
            });
          } else {
            this.swapFormService.commonTrade.controls.input.patchValue({
              toBlockchain: token.blockchain
            });
            this.swapFormService.commonTrade.controls.input.patchValue({
              toToken: token
            });
          }
        }
      });
  }

  clearToken() {
    this.selectedToken = null;
    const formKey = this.tokenType === 'from' ? 'fromToken' : 'toToken';
    this.swapFormService.commonTrade.controls.input.patchValue({ [formKey]: null });
  }
}
