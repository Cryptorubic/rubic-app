import { ChangeDetectionStrategy, Component, inject, Injector } from '@angular/core';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import { createCheckoutSession } from '@zkp2p/pay-sdk';
import { BehaviorSubject, from, map, Observable, of } from 'rxjs';
import { Zkp2pService } from '../../services/zkp2p.service';
import { SwapAmount } from '@app/features/privacy/providers/shared-privacy-providers/models/swap-info';
import { AbstractControl, AsyncValidatorFn, FormControl, ValidationErrors } from '@angular/forms';
import { Web3Pure } from '@cryptorubic/web3';
import { BLOCKCHAIN_NAME, blockchainId } from '@cryptorubic/core';

@Component({
  selector: 'app-zkp2p-form',
  templateUrl: './zkp2p-form.component.html',
  styleUrls: ['./zkp2p-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Zkp2pFormComponent {
  private readonly zkp2pService = inject(Zkp2pService);

  private readonly injector = inject(Injector);

  // eslint-disable-next-line rxjs/no-exposed-subjects
  public readonly transferAsset$ = new BehaviorSubject<BalanceToken | null>(null);

  // eslint-disable-next-line rxjs/no-exposed-subjects
  public readonly transferAmount$ = new BehaviorSubject<SwapAmount | null>(null);

  // eslint-disable-next-line rxjs/no-exposed-subjects
  public readonly loading$ = new BehaviorSubject<boolean>(false);

  public readonly receiverCtrl = new FormControl<string>('', {
    asyncValidators: [this.isReceiverCorrect()]
  });

  private isReceiverCorrect(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }
      const blockchain = this.transferAsset$.getValue()?.blockchain || BLOCKCHAIN_NAME.ETHEREUM;
      return from(Web3Pure.getInstance(blockchain).isAddressCorrect(control.value)).pipe(
        map(isCorrect => (isCorrect ? null : { incorrectAddress: true }))
      );
    };
  }

  public openSelector(): void {
    this.zkp2pService
      .openTokensModal(this.injector, 'from')
      .subscribe((selectedToken: BalanceToken) => {
        this.transferAsset$.next(selectedToken);
        this.receiverCtrl.updateValueAndValidity();
      });
  }

  public updateInputValue(value: SwapAmount): void {
    this.transferAmount$.next(value);
  }

  async swap(): Promise<void> {
    this.loading$.next(true);

    const token = this.transferAsset$.getValue();
    const amount = this.transferAmount$.getValue().actualValue.toFixed(6);
    const chain =
      token.blockchain === BLOCKCHAIN_NAME.SOLANA ? 792703809 : blockchainId[token.blockchain];
    const recipientAddress = this.receiverCtrl.value;

    try {
      const urlWithoutQuery = window.location.href.split('?')[0];
      const session = await createCheckoutSession(
        {
          merchantId: 'cmnfujh3503trbppexzi6jkn4',
          amountUsdc: amount,
          destinationChainId: chain,
          destinationToken: token.address,
          recipientAddress,
          successUrl: `${urlWithoutQuery}?status=success`,
          cancelUrl: `${urlWithoutQuery}?status=cancel`,
          metadata: {
            // orderId: 'order_123',
            // customerId: 'cust_456'
          }
        },
        {
          apiBaseUrl: 'https://api.pay.peer.xyz',
          apiKey: 'f9b51cb451a35a3399124864b14c8e75bd67a9748ac95ed5'
        }
      );
      window.open(session.checkoutUrl, '_blank');
    } catch (error) {
      console.error(error);
    } finally {
      this.loading$.next(false);
    }
  }
}
