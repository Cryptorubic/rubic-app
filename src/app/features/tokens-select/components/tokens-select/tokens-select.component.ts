import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit
} from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME } from '../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import { TokenAmount } from '../../../../shared/models/tokens/TokenAmount';
import { Web3PublicService } from '../../../../core/services/blockchain/web3-public-service/web3-public.service';
import { Web3Public } from '../../../../core/services/blockchain/web3-public-service/Web3Public';
import { BlockchainToken } from '../../../../shared/models/tokens/BlockchainToken';
import { AuthService } from '../../../../core/services/auth/auth.service';

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
    address: '0x1000000000000000000000000000000000000000',
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
    address: '0x2000000000000000000000000000000000000000',
    name: 'DaiToken',
    symbol: 'DAI',
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
    address: '0x3000000000000000000000000000000000000000',
    name: 'noname',
    symbol: 'USDT',
    decimals: 18,
    amount: new BigNumber(1234567899998.1234)
  },
  {
    image: 'http://api.rubic.exchange/media/token_images/cg_logo_bnb_binance-coin-logo_ij3DxE0.png',
    rank: 0.5,
    price: 200,
    usedInIframe: true,
    blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    address: '0x4000000000000000000000000000000000000000',
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
    amount: new BigNumber(0)
  },
  {
    image: 'http://api.rubic.exchange/media/token_images/MATIC_logo.webp',
    rank: 0.5,
    price: 200,
    usedInIframe: true,
    blockchain: BLOCKCHAIN_NAME.POLYGON,
    address: '0x5000000000000000000000000000000000000000',
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
  public customToken: TokenAmount;

  public allTokens$: Observable<TokenAmount[]> = of(mockTokens);

  public tokensToShow$ = new BehaviorSubject<TokenAmount[]>([]);

  private _blockchain = BLOCKCHAIN_NAME.ETHEREUM;

  private _query = '';

  get blockchain(): BLOCKCHAIN_NAME {
    return this._blockchain;
  }

  set blockchain(value: BLOCKCHAIN_NAME) {
    this._blockchain = value;
    this.updateTokensList();
  }

  get query(): string {
    return this._query;
  }

  set query(value: string) {
    this._query = value;
    this.updateTokensList();
  }

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext<TokenAmount>,
    private cdr: ChangeDetectorRef,
    private web3PublicService: Web3PublicService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.updateTokensList();
  }

  close() {
    this.context.completeWith(null);
  }

  onTokenSelect(token: TokenAmount) {
    this.context.completeWith(token);
  }

  private updateTokensList(): void {
    this.customToken = null;
    this.allTokens$.subscribe(tokens => {
      const currentBlockchainTokens = tokens.filter(token => token.blockchain === this.blockchain);
      const sortedAndFilteredTokens = this.filterAndSortTokens(currentBlockchainTokens);
      this.tokensToShow$.next(sortedAndFilteredTokens);

      if (!sortedAndFilteredTokens.length) {
        this.tryParseQueryAsCustomToken();
      }
    });
  }

  private filterAndSortTokens(tokens: TokenAmount[]): TokenAmount[] {
    const comparator = (a: TokenAmount, b: TokenAmount) => {
      const amountsDelta = b.amount
        .multipliedBy(b.price)
        .minus(a.amount.multipliedBy(a.price))
        .toNumber();
      return amountsDelta || b.rank - a.rank;
    };

    const query = this.query.toLowerCase();
    if (!query) {
      return tokens.sort(comparator);
    }

    const sybmolMatchingTokens = tokens
      .filter(token => token.symbol.toLowerCase().includes(query))
      .sort(comparator);
    const nameMatchingTokens = tokens
      .filter(
        token =>
          token.name.toLowerCase().includes(query) &&
          sybmolMatchingTokens.every(item => item.address !== token.address)
      )
      .sort(comparator);

    return sybmolMatchingTokens.concat(nameMatchingTokens);
  }

  private async tryParseQueryAsCustomToken(): Promise<void> {
    if (this.query) {
      const web3Public: Web3Public = this.web3PublicService[this.blockchain];

      if (!web3Public.isAddressCorrect(this.query)) {
        return;
      }

      const blockchainToken: BlockchainToken = await web3Public.getTokenInfo(this.query);

      if (blockchainToken?.name && blockchainToken?.symbol && blockchainToken?.decimals) {
        const amount = this.authService.user?.address
          ? (await web3Public.getTokenBalance(this.authService.user.address, this.query)).div(
              10 ** blockchainToken.decimals
            )
          : new BigNumber(0);

        this.customToken = {
          ...blockchainToken,
          rank: 0,
          image: 'assets/images/icons/coins/default-token-ico.webp',
          amount,
          price: 0,
          usedInIframe: true
        };

        this.cdr.detectChanges();
      }
    }
  }
}
