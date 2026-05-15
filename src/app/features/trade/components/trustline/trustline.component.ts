import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { TrustlineService } from '../../services/trustline-service/trustline.service';
import { BehaviorSubject } from 'rxjs';
import { TrustlineButtonState } from './models/trustline-button-state';
import { BLOCKCHAIN_NAME } from '@cryptorubic/core';
import { TRUSTLINE_TYPE_TEXT } from './models/trustline-type';
import { TrustlineComponentOptions } from './models/trustline-component-options';

@Component({
  selector: 'app-trustline',
  templateUrl: './trustline.component.html',
  styleUrls: ['./trustline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrustlineComponent implements OnInit {
  @Input({ required: true }) options: TrustlineComponentOptions;

  @Output() onTrustlineAdd = new EventEmitter<void>();

  constructor(private readonly trustlineService: TrustlineService) {}

  ngOnInit(): void {
    this.setInitialState();
  }

  public get trustlineText(): string {
    return TRUSTLINE_TYPE_TEXT[this.options.trustlineType](this.options.trustlineToken.symbol);
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

  private setInitialState(): void {
    if (this.options.receiver && this.options.toBlockchain === BLOCKCHAIN_NAME.STELLAR) {
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

  private async connectReceiver(): Promise<void> {
    this.setLoadingState();

    const isConnected = await this.trustlineService.connectReceiverWallet(this.options.receiver);

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

    const hash = await this.trustlineService.addTrustline(this.options.trustlineToken.address);
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
