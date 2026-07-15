import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  Inject,
  Injector,
  Input,
  OnInit,
  Output,
  inject
} from '@angular/core';
import { TrustlineService } from '../../services/trustline-service/trustline.service';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { TrustlineButtonState } from './models/trustline-button-state';
import { BLOCKCHAIN_NAME } from '@cryptorubic/core';
import { TRUSTLINE_TYPE_TEXT } from './models/trustline-type';
import { TrustlineComponentOptions } from './models/trustline-component-options';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { ModalService } from '@core/modals/services/modal.service';

@Component({
  standalone: false,
  selector: 'app-trustline',
  templateUrl: './trustline.component.html',
  styleUrls: ['./trustline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrustlineComponent implements OnInit {
  @Input({ required: true }) options!: TrustlineComponentOptions;

  @Output() onTrustlineAdd = new EventEmitter<void>();

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly trustlineService: TrustlineService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly modalService: ModalService,
    @Inject(Injector) private readonly injector: Injector
  ) {}

  ngOnInit(): void {
    this.walletConnectorService.addressChange$
      .pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(address => this.setInitialState(address));
  }

  public get trustlineText(): string {
    return TRUSTLINE_TYPE_TEXT[this.options.trustlineType](
      this.options.trustlineToken.symbol,
      this.options.toBlockchain
    );
  }

  private readonly _buttonState$ = new BehaviorSubject<TrustlineButtonState | null>(null);

  private readonly _prevButtonState$ = new BehaviorSubject<TrustlineButtonState | null>(null);

  public readonly buttonState$ = this._buttonState$.asObservable();

  private setButtonState(state: TrustlineButtonState): void {
    this._prevButtonState$.next(this._buttonState$.getValue());
    this._buttonState$.next(state);
  }

  private setPrevButtonState(): void {
    this._buttonState$.next(this._prevButtonState$.getValue());
  }

  private setInitialState(
    walletAddress: string | null = this.walletConnectorService.address
  ): void {
    if (!walletAddress) {
      this.setButtonState({
        label: 'Connect Wallet',
        action: () => this.connectWallet(),
        disabled: false
      });
    } else if (this.options.receiver && this.isReceiverWalletConnectionRequired()) {
      this.setButtonState({
        label: 'Connect Receiver',
        action: () => this.connectReceiver(),
        disabled: false
      });
    } else {
      this.setButtonState({
        label: 'Enable Asset',
        action: () => this.addTrustline(),
        disabled: false
      });
    }
  }

  private isReceiverWalletConnectionRequired(): boolean {
    return (
      this.options.toBlockchain === BLOCKCHAIN_NAME.STELLAR ||
      this.options.toBlockchain === BLOCKCHAIN_NAME.RIPPLE
    );
  }

  private async connectWallet(): Promise<void> {
    this.modalService.openWalletModal(this.injector).subscribe();
  }

  private async connectReceiver(): Promise<void> {
    this.setLoadingState();

    const isConnected = await this.trustlineService.connectReceiverWallet(
      this.options.receiver!,
      this.options.toBlockchain as typeof BLOCKCHAIN_NAME.STELLAR | typeof BLOCKCHAIN_NAME.RIPPLE
    );

    if (isConnected) {
      this.setButtonState({
        label: 'Enable Asset',
        action: () => this.addTrustline(),
        disabled: false
      });
    } else {
      this.setPrevButtonState();
    }
  }

  private async addTrustline(): Promise<void> {
    this.setLoadingState();

    const hash = await this.trustlineService.addTrustline(
      this.options.trustlineToken.address,
      this.options.toBlockchain as typeof BLOCKCHAIN_NAME.STELLAR | typeof BLOCKCHAIN_NAME.RIPPLE
    );
    if (hash) {
      this.onTrustlineAdd.emit();
    } else {
      this.setPrevButtonState();
    }
  }

  private setLoadingState(): void {
    this.setButtonState({
      label: 'Loading...',
      disabled: true
    });
  }
}
