import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { Observable, of } from 'rxjs';
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
    amount: new BigNumber(1.23456)
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
    amount: new BigNumber(123456.123456)
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
    amount: new BigNumber(123456.1234)
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
    amount: new BigNumber(123456.1234)
  },
  {
    image:
      'https://raw.githubusercontent.com/MyWishPlatform/etherscan_top_tokens_images/master/fa-empire.png',
    rank: 0.5,
    price: 200,
    usedInIframe: true,
    blockchain: BLOCKCHAIN_NAME.ETHEREUM,
    address: '0x0000000000000000000000000000000000000000',
    name: 'Weenus',
    symbol: 'WEENUS',
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
export class TokensSelectComponent {
  public tokens$: Observable<TokenAmount[]> = of(mockTokens);

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext<TokenAmount>
  ) {}

  close() {
    this.context.completeWith(null);
  }
}
