import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import { FormService } from 'src/app/shared/models/swaps/FormService';
import { startWith } from 'rxjs/operators';
import { NATIVE_TOKEN_ADDRESS } from 'src/app/shared/constants/blockchain/NATIVE_TOKEN_ADDRESS';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';
import { Subscription } from 'rxjs';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';

const WETH_ADDRESSES = {
  [BLOCKCHAIN_NAME.ETHEREUM]: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
  [BLOCKCHAIN_NAME.POLYGON]: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270'
};

@Component({
  selector: 'app-analytics-link',
  templateUrl: './analytics-link.component.html',
  styleUrls: ['./analytics-link.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalyticsLinkComponent implements OnInit, OnDestroy {
  @Input() public formService: FormService;

  private fromToken: TokenAmount;

  private toToken: TokenAmount;

  private formServiceSub$: Subscription;

  get tokenInfoUrl(): string {
    let tokenAddress: string;
    if (
      this.toToken &&
      this.web3PublicService[BLOCKCHAIN_NAME.ETHEREUM].isAddressCorrect(this.toToken.address)
    ) {
      if (this.toToken.address === NATIVE_TOKEN_ADDRESS) {
        tokenAddress = WETH_ADDRESSES[this.toToken.blockchain];
      } else {
        tokenAddress = this.toToken.address;
      }
    } else if (this.fromToken) {
      if (this.fromToken.address === NATIVE_TOKEN_ADDRESS) {
        tokenAddress = WETH_ADDRESSES[this.fromToken.blockchain];
      } else {
        tokenAddress = this.fromToken.address;
      }
    }
    return tokenAddress ? `t/${tokenAddress}` : '';
  }

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly web3PublicService: Web3PublicService
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
