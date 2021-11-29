import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import { FormService } from 'src/app/shared/models/swaps/FormService';
import { startWith } from 'rxjs/operators';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { Subscription } from 'rxjs';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/web3/web3-public-service/public-blockchain-adapter.service';

const WETH_ADDRESSES = {
  [BLOCKCHAIN_NAME.ETHEREUM]: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
  [BLOCKCHAIN_NAME.POLYGON]: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270'
};

type WethBlockchains = keyof typeof WETH_ADDRESSES;

@Component({
  selector: 'app-analytics-link',
  templateUrl: './analytics-link.component.html',
  styleUrls: ['./analytics-link.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalyticsLinkComponent implements OnInit, OnDestroy {
  @Input() public formService: FormService;

  public fromToken: TokenAmount;

  public toToken: TokenAmount;

  public blockchainNames = BLOCKCHAIN_NAME;

  private formServiceSub$: Subscription;

  /**
   * Gets token info url.
   */
  get tokenInfoUrl(): string {
    let tokenAddress: string;
    const fromBlockchainAdapter = this.publicBlockchainAdapterService[this.fromToken?.blockchain];
    const toBlockchainAdapter = this.publicBlockchainAdapterService[this.toToken?.blockchain];

    if (toBlockchainAdapter?.isAddressCorrect(this.toToken.address)) {
      tokenAddress = toBlockchainAdapter.isNativeAddress(this.toToken.address)
        ? WETH_ADDRESSES[this.toToken.blockchain as WethBlockchains]
        : this.toToken.address;
    } else if (fromBlockchainAdapter?.isAddressCorrect(this.fromToken.address)) {
      tokenAddress = fromBlockchainAdapter.isNativeAddress(this.fromToken.address)
        ? WETH_ADDRESSES[this.fromToken.blockchain as WethBlockchains]
        : this.fromToken.address;
    }
    return tokenAddress ? `t/${tokenAddress}` : '';
  }

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly publicBlockchainAdapterService: PublicBlockchainAdapterService
  ) {}

  ngOnInit() {
    this.formServiceSub$ = this.formService.inputValueChanges
      .pipe(startWith(this.formService.inputValue))
      .subscribe(form => {
        this.fromToken = form.fromToken;
        this.toToken = form.toToken;
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy() {
    this.formServiceSub$.unsubscribe();
  }
}
