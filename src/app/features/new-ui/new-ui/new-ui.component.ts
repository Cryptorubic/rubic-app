import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  QueryList,
  TemplateRef,
  ViewChildren
} from '@angular/core';
import { IToken } from 'src/app/shared/models/tokens/IToken';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { NATIVE_TOKEN_ADDRESS } from 'src/app/shared/constants/blockchain/NATIVE_TOKEN_ADDRESS';
import { NewUiDataService } from 'src/app/features/new-ui/new-ui-data.service';
import { of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TokensSelectService } from '../../tokens-select/services/tokens-select.service';
import { ErrorsService } from '../../../core/errors/errors.service';
import { RubicError } from '../../../shared/models/errors/RubicError';
import { NotSupportedNetworkError } from '../../../shared/models/errors/provider/NotSupportedNetwork';

@Component({
  selector: 'app-new-ui',
  templateUrl: './new-ui.component.html',
  styleUrls: ['./new-ui.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewUiComponent implements OnInit {
  @ViewChildren('dropdownOptionTemplate') dropdownOptionsTemplates: QueryList<TemplateRef<any>>;

  public readonly avatarUrl = './assets/images/rubic-logo-main.svg';

  public readonly options = ['first', 'second', 'third'];

  public tokenAmountFrom = '';

  public minTokenAmount = 100;

  public ethToken: IToken = {
    blockchain: BLOCKCHAIN_NAME.ETHEREUM,
    address: NATIVE_TOKEN_ADDRESS,
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
    image: 'http://dev-api.rubic.exchange/media/token_images/cg_logo_ETH_ethereum_4jp3DKD.png',
    rank: 1.0,
    price: 2543.11,
    usedInIframe: true
  };

  constructor(
    private readonly cdr: ChangeDetectorRef,
    public readonly store: NewUiDataService,
    private readonly tokensSelectService: TokensSelectService,
    private readonly errorsService: ErrorsService
  ) {}

  ngOnInit(): void {
    // mock http requests
    setTimeout(() => {
      this.cdr.markForCheck();
      this.ethToken = {
        ...this.ethToken,
        // @ts-ignore
        userBalance: 2000.343443
      };
      this.tokenAmountFrom = '123.32';
      this.minTokenAmount = 50;
    }, 3000);
  }

  onClick(event: MouseEvent) {
    console.log('click', event);
  }

  openTokensSelect() {
    this.tokensSelectService
      .showDialog()
      .subscribe(token =>
        alert(`Token ${token.symbol} in ${token.blockchain} blockchain selected`)
      );
  }

  onOptionChange(optionIndex: number): void {
    console.log('chosen option: ', this.options[optionIndex]);
  }

  onTokenAmountFromChange(amount: string): void {
    this.tokenAmountFrom = amount;
    console.log('token amount from', amount);
  }

  handleError() {
    const source = throwError(new NotSupportedNetworkError('Ethereum'));
    source.pipe(catchError(this.errorsService.catch$)).subscribe();
  }
}
