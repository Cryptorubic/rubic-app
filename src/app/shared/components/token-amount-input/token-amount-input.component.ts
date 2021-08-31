import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import BigNumber from 'bignumber.js';
import { FormControl } from '@angular/forms';
import { BIG_NUMBER_FORMAT } from 'src/app/shared/constants/formats/BIG_NUMBER_FORMAT';
import { AvailableTokenAmount } from 'src/app/shared/models/tokens/AvailableTokenAmount';
import { FormService } from 'src/app/shared/models/swaps/FormService';
import { NATIVE_TOKEN_ADDRESS } from 'src/app/shared/constants/blockchain/NATIVE_TOKEN_ADDRESS';
import networks from 'src/app/shared/constants/blockchain/networks';
import CustomError from 'src/app/core/errors/models/custom-error';
import { NotificationsService } from 'src/app/core/services/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { TokenAmount } from '../../models/tokens/TokenAmount';

@Component({
  selector: 'app-token-amount-input',
  templateUrl: './token-amount-input.component.html',
  styleUrls: ['./token-amount-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokenAmountInputComponent {
  @Input() loading: boolean;

  @Input() tokens: AvailableTokenAmount[];

  @Input() formService: FormService;

  @Input() placeholder = '0.0';

  @Input() token?: TokenAmount;

  @Input() displayMaxButton: boolean;

  @Input() maxGasFee: BigNumber = new BigNumber(0);

  @Input() set amount(value: BigNumber) {
    if (value && !value.isNaN() && !value.eq(this.amount)) {
      this.amountControl.setValue(value.toFixed());
    }
  }

  get amount() {
    return new BigNumber(this.amountControl.value.split(',').join('') || 0);
  }

  get usdPrice(): BigNumber {
    return this.amount.multipliedBy(this.token?.price ?? 0);
  }

  @Output() amountChange = new EventEmitter<string>();

  public readonly DEFAULT_DECIMALS = 18;

  public amountControl = new FormControl('');

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly notificationsService: NotificationsService,
    private readonly translateService: TranslateService
  ) {}

  public onUserBalanceMaxButtonClick(): void {
    const { amount, address, blockchain } = this.token;
    // if (address === NATIVE_TOKEN_ADDRESS) {
    //   const maxAmount = amount.minus(this.maxGasFee);
    //
    // if (maxAmount.gt(0)) {
    //   this.amountControl.setValue(maxAmount.toFormat(BIG_NUMBER_FORMAT));
    // } else {
    // const nativeTokenSymbol = networks.find(el => el.name === blockchain).nativeCoin.symbol;
    // this.notificationsService.show(
    //   this.translateService.instant('notifications.minerFee', {
    //     nativeTokenSymbol
    //   }),
    //   { autoClose: 7000 }
    // );
    //   }
    // } else {
    //   this.amountControl.setValue(amount.toFormat(BIG_NUMBER_FORMAT));
    // }
    this.amountControl.setValue(amount.toFormat(BIG_NUMBER_FORMAT));
  }

  public emitAmountChange(amount: string): void {
    this.amountControl.setValue(amount, { emitViewToModelChange: false });
    this.amountChange.emit(amount.split(',').join(''));
  }
}
