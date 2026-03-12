import { ChangeDetectionStrategy, Component, OnInit, Self, inject } from '@angular/core';
import { BehaviorSubject, takeUntil } from 'rxjs';
import { PRIVACYCASH_STEPS } from '../../constants/privacycash-steps';
import { Step, StepType } from '../../models/step';
import { PageType } from '../../../shared-privacy-providers/components/page-navigation/models/page-type';
import { PrivacycashTokensService } from '../../services/common/token-facades/privacycash-tokens.service';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { TuiDestroyService } from '@taiga-ui/cdk';

@Component({
  selector: 'app-privacy-cash-view',
  templateUrl: './privacycash-main-page.component.html',
  styleUrls: ['./privacycash-main-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class PrivacycashMainPageComponent implements OnInit {
  private readonly privacycashTokensService = inject(PrivacycashTokensService);

  private readonly walletConnectorService = inject(WalletConnectorService);

  public readonly steps = PRIVACYCASH_STEPS;

  private readonly _currentStep$ = new BehaviorSubject<Step>(this.steps[0]);

  public readonly currentStep$ = this._currentStep$.asObservable();

  constructor(@Self() private readonly destroy$: TuiDestroyService) {}

  ngOnInit(): void {
    this.walletConnectorService.addressChange$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.privacycashTokensService.updatePrivateBalances();
    });
    this.privacycashTokensService.updateBalances$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.privacycashTokensService.loadTokensListWithBalances();
    });
  }

  public onStepChange(value: PageType): void {
    const stepType = value.type as StepType;
    const currentStep = this.steps.find(s => s.type === stepType) || this.steps[0];
    this._currentStep$.next(currentStep);
  }
}
