import { ChangeDetectionStrategy, Component, OnInit, Self, inject } from '@angular/core';
import { BehaviorSubject, Observable, combineLatestWith, filter, map, takeUntil } from 'rxjs';
import { PRIVACYCASH_STEPS } from '../../constants/privacycash-steps';
import { Step, StepType } from '../../models/step';
import { PageType } from '../../../shared-privacy-providers/components/page-navigation/models/page-type';
import { PrivacycashTokensService } from '../../services/common/token-facades/privacycash-tokens.service';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { EphemeralWalletTokensService } from '../../services/common/token-facades/ephemeral-wallet-tokens.service';
import { PrivacycashSignatureService } from '../../services/privacy-cash-signature.service';
import { isNil } from '@app/shared/utils/utils';

@Component({
  selector: 'app-privacy-cash-view',
  templateUrl: './privacycash-main-page.component.html',
  styleUrls: ['./privacycash-main-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class PrivacycashMainPageComponent implements OnInit {
  private readonly privacycashTokensService = inject(PrivacycashTokensService);

  private readonly ephemeralWalletTokensService = inject(EphemeralWalletTokensService);

  private readonly walletConnectorService = inject(WalletConnectorService);

  private readonly privacycashSignatureService = inject(PrivacycashSignatureService);

  public readonly steps = PRIVACYCASH_STEPS;

  private readonly _currentStep$ = new BehaviorSubject<Step>(
    this.steps.find(step => step.type === 'login')
  );

  public readonly currentStep$ = this._currentStep$.asObservable();

  public readonly disabledPages$: Observable<PageType[]> =
    this.privacycashSignatureService.signature$.pipe(
      map(signature => {
        if (!isNil(signature) && signature.length) return [];
        return this.steps.filter(step => step.type !== 'login');
      })
    );

  constructor(@Self() private readonly destroy$: TuiDestroyService) {}

  ngOnInit(): void {
    this.walletConnectorService.addressChange$
      .pipe(takeUntil(this.destroy$))
      .subscribe(userAddr => {
        if (userAddr) {
          this.privacycashTokensService.updatePrivateBalances();
        } else {
          this.privacycashSignatureService.removeSignature();
          this._currentStep$.next(this.steps.find(step => step.type === 'login'));
        }
      });
    this.privacycashTokensService.updateBalances$
      .pipe(
        combineLatestWith(this.privacycashSignatureService.signature$),
        filter(([_, signature]) => !!signature && signature.length > 0),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.privacycashTokensService.loadBalances();
      });
    this.ephemeralWalletTokensService.updateBalances$
      .pipe(
        combineLatestWith(this.privacycashSignatureService.signature$),
        filter(([_, signature]) => !!signature && signature.length > 0),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.ephemeralWalletTokensService.loadBalances();
      });
  }

  public onStepChange(value: PageType): void {
    const stepType = value.type as StepType;
    const currentStep = this.steps.find(s => s.type === stepType) || this.steps[0];
    this._currentStep$.next(currentStep);
  }
}
