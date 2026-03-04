import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Injector,
  Output
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Token, TokenAmount } from '@cryptorubic/core';
import { BalanceToken } from '@shared/models/tokens/balance-token';
import BigNumber from 'bignumber.js';
import { PrivateModalsService } from '@features/privacy/providers/shared-privacy-providers/services/private-modals/private-modals.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { PrivateEvent } from '../../models/private-event';

@Component({
  selector: 'app-hide-tokens-window',
  templateUrl: './hide-tokens-window.component.html',
  styleUrls: ['./hide-tokens-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('receiverAnimation', [
      transition(':enter', [
        style({ height: '0px', opacity: 0.5 }),
        animate('0.2s ease-out', style({ height: '56px', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ opacity: 1, height: '56px' }),
        animate('0.2s ease-in', style({ height: '0px', opacity: 0 }))
      ])
    ])
  ]
})
export class HideTokensWindowComponent {
  @Output() public handleHide = new EventEmitter<PrivateEvent>();

  private readonly _displayReceiver$ = new BehaviorSubject<boolean>(false);

  public readonly displayReceiver$ = this._displayReceiver$.asObservable();

  private readonly _hideAsset$ = new BehaviorSubject<BalanceToken | null>(null);

  public readonly hideAsset$ = this._hideAsset$.asObservable();

  private readonly _hideAmount$ = new BehaviorSubject<{
    visibleValue: string;
    actualValue: BigNumber;
  } | null>(null);

  public readonly hideAmount$ = this._hideAmount$.asObservable();

  // private readonly hideService = inject(HideService);

  private readonly injector = inject(Injector);

  private readonly modalService = inject(PrivateModalsService);

  private readonly _loading$ = new BehaviorSubject<boolean>(false);

  public readonly loading$ = this._loading$.asObservable();

  public openSelector(): void {
    this.modalService
      .openPublicTokensModal(this.injector)
      .subscribe((selectedToken: BalanceToken) => {
        this._hideAsset$.next(selectedToken);
      });
  }

  public updateInputValue(value: { visibleValue: string; actualValue: BigNumber }): void {
    this._hideAmount$.next(value);
  }

  public handleMaxButton(): void {}

  public async hide(): Promise<void> {
    this._loading$.next(true);
    const token = new TokenAmount({
      ...this._hideAsset$.value,
      weiAmount: Token.toWei(this._hideAmount$.value?.actualValue, this._hideAsset$.value?.decimals)
    });
    this.handleHide.emit({ token, loadingCallback: () => this._loading$.next(false) });
  }

  public toggleReceiver(): void {
    this._displayReceiver$.next(!this._displayReceiver$.value);
  }
}
