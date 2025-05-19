import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ProofInfo } from '@features/testnet-promo/interfaces/api-models';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { TestnetPromoClaimService } from '@features/testnet-promo/services/testnet-promo-claim.service';

type ButtonState = 'active' | 'loading' | 'claimed';

@Component({
  selector: 'app-active-claim',
  templateUrl: './active-claim.component.html',
  styleUrls: ['./active-claim.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActiveClaimComponent {
  private readonly _buttonStatus$ = new BehaviorSubject<ButtonState>('active');

  public readonly buttonState$ = this._buttonStatus$.asObservable();

  public readonly buttonLabel$ = this.buttonState$.pipe(
    map(state => {
      const stateLabelMap: Record<ButtonState, string> = {
        active: 'Claim',
        loading: 'Loading',
        claimed: 'Claimed'
      };
      return stateLabelMap[state];
    })
  );

  @Input({ required: true }) round: ProofInfo;

  @Output() handleClaim = new EventEmitter<void>();

  constructor(private readonly claimService: TestnetPromoClaimService) {}

  public async handleButtonClick(state: ButtonState): Promise<void> {
    if (state === 'active') {
      this._buttonStatus$.next('loading');
      try {
        await this.claimService.claimTokens();
        this._buttonStatus$.next('claimed');
      } catch (err) {
        this._buttonStatus$.next('active');
      }
    }
  }
}
