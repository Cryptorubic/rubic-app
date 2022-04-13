import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { EthLikeWeb3Public } from '@app/core/services/blockchain/blockchain-adapters/eth-like/web3-public/eth-like-web3-public';
import { FormControl } from '@ngneat/reactive-forms';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { BehaviorSubject } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LiquidityProvidingNotificationService } from '../../services/liquidity-providing-notification.service';
import { LiquidityProvidingService } from '../../services/liquidity-providing.service';

function correctAddressValidator(blockchainAdapter: EthLikeWeb3Public): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const isAddressCorrect = blockchainAdapter.isAddressCorrect(control.value);
    return isAddressCorrect ? null : { wrongAddress: control.value };
  };
}

@Component({
  selector: 'app-transfer-modal',
  templateUrl: './transfer-modal.component.html',
  styleUrls: ['./transfer-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransferModalComponent implements OnInit {
  public readonly deposits = this.lpService.deposits
    .filter(deposits => deposits.isStaked)
    .map(deposit => deposit.tokenId);

  public readonly address = new FormControl(null, [
    Validators.required,
    correctAddressValidator(this.lpService.blockchainAdapter)
  ]);

  public readonly token = new FormControl(this.deposits[0] || null, [Validators.required]);

  private readonly _buttonLoading$ = new BehaviorSubject(false);

  public readonly buttonLoading$ = this._buttonLoading$.asObservable();

  constructor(
    private readonly lpService: LiquidityProvidingService,
    private readonly notificationService: LiquidityProvidingNotificationService,
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext
  ) {}

  ngOnInit(): void {
    return undefined;
  }

  public transfer(): void {
    const tokenId = this.token.value;
    const address = this.address.value;

    this._buttonLoading$.next(true);

    this.lpService
      .transfer(tokenId, address)
      .pipe(finalize(() => this._buttonLoading$.next(false)))
      .subscribe(() => {
        this.notificationService.showSuccessTransferNotification();

        this.lpService.setDepositsLoading(false);

        this.context.completeWith(undefined);
      });
  }
}
