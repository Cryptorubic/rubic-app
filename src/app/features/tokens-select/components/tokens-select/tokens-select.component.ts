import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME } from '../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import { TokenAmount } from '../../../../shared/models/tokens/TokenAmount';

const mockTokens: TokenAmount[] = [
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
    amount: new BigNumber(12345678999999.23456)
  },
  {
    image: 'http://api.rubic.exchange/media/token_images/RBC_logo_new_I8eqPBM.png',
    rank: 0.5,
    price: 200,
    usedInIframe: true,
    blockchain: BLOCKCHAIN_NAME.ETHEREUM,
    address: '0x0000000000000000000000000000000000000000',
    name: 'Weenus',
    symbol: 'WEENUS',
    decimals: 18,
    amount: new BigNumber(123456789.123456)
  },
  {
    image: 'http://api.rubic.exchange/media/token_images/cg_logo_USDT_Tether-logo_gx5smb6.png',
    rank: 0.4,
    price: 200,
    usedInIframe: true,
    blockchain: BLOCKCHAIN_NAME.ETHEREUM,
    address: '0x0000000000000000000000000000000000000000',
    name: 'Yeenus',
    symbol: 'YEENUS',
    decimals: 18,
    amount: new BigNumber(123456789999.123456)
  },
  {
    image:
      'https://raw.githubusercontent.com/MyWishPlatform/etherscan_top_tokens_images/master/fa-empire.png',
    rank: 0.3,
    price: 200,
    usedInIframe: true,
    blockchain: BLOCKCHAIN_NAME.ETHEREUM,
    address: '0x0000000000000000000000000000000000000000',
    name: 'Yeenus',
    symbol: 'XEENUS',
    decimals: 18,
    amount: new BigNumber(1234567899998.1234)
  },
  {
    image: 'http://api.rubic.exchange/media/token_images/cg_logo_bnb_binance-coin-logo_ij3DxE0.png',
    rank: 0.5,
    price: 200,
    usedInIframe: true,
    blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    address: '0x0000000000000000000000000000000000000000',
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
    amount: new BigNumber(123456.1234)
  },
  {
    image: 'http://api.rubic.exchange/media/token_images/MATIC_logo.webp',
    rank: 0.5,
    price: 200,
    usedInIframe: true,
    blockchain: BLOCKCHAIN_NAME.POLYGON,
    address: '0x0000000000000000000000000000000000000000',
    name: 'Matic',
    symbol: 'MATIC',
    decimals: 18,
    amount: new BigNumber(123456.1234)
  }
];

@Component({
  selector: 'app-tokens-select',
  templateUrl: './tokens-select.component.html',
  styleUrls: ['./tokens-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokensSelectComponent implements OnInit {
  public allTokens$: Observable<TokenAmount[]> = of(mockTokens);

  public tokensToShow$ = new BehaviorSubject<TokenAmount[]>([]);

  private _blockchain: BLOCKCHAIN_NAME = BLOCKCHAIN_NAME.ETHEREUM;

  get blockchain(): BLOCKCHAIN_NAME {
    return this._blockchain;
  }

  set blockchain(value: BLOCKCHAIN_NAME) {
    this._blockchain = value;
    this.updateTokensList();
  }

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext<TokenAmount>
  ) {}

  ngOnInit() {
    this.updateTokensList();
  }

  close() {
    this.context.completeWith(null);
  }

  private updateTokensList() {
    this.allTokens$.subscribe(tokens => {
      const currentBlockchainTokens = tokens.filter(token => token.blockchain === this.blockchain);
      this.tokensToShow$.next(currentBlockchainTokens);
    });
  }
}
