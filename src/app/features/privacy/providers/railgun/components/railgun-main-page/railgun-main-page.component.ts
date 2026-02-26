import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RailgunService } from '@features/privacy/providers/railgun/services/railgun/railgun.service';
import { BehaviorSubject, from, of } from 'rxjs';
import { switchTap } from '@shared/utils/utils';
import { MnemonicService } from '@features/privacy/providers/railgun/services/mnemonic/mnemonic.service';
import { RailgunWalletInfo } from '@railgun-community/shared-models';
import { RubicAny } from '@shared/models/utility-types/rubic-any';
import { BalanceControllerService } from '@features/privacy/providers/railgun/services/balance-controller/balance-controller.service';
import { BlockchainName, BlockchainsInfo } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { PublicAccount } from '@features/privacy/providers/railgun/models/public-account';
import { StepType } from '@features/privacy/providers/railgun/models/step';

@Component({
  selector: 'app-railgun-main-page',
  templateUrl: './railgun-main-page.component.html',
  styleUrls: ['./railgun-main-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RailgunMainPageComponent {
  private readonly _currentStep$ = new BehaviorSubject<StepType>('connectWallet');

  public readonly currentStep$ = this._currentStep$.asObservable();

  private readonly mnemonicService = inject(MnemonicService);

  private readonly balanceController = inject(BalanceControllerService);

  private readonly _account$ = new BehaviorSubject<PublicAccount | null>(null);

  public readonly account$ = this._account$.asObservable().pipe(
    switchTap(account => {
      if (account) {
        return from(this.handleAccount(account));
      }
      return of(null);
    })
  );

  private readonly _railgunAccount$ = new BehaviorSubject<RailgunWalletInfo | null>(null);

  public readonly railgunAccount$ = this._railgunAccount$.asObservable();

  private readonly _balances$ = new BehaviorSubject<
    | {
        address: string;
        amount: string;
        blockchain: BlockchainName;
      }[]
    | null
  >(null);

  public readonly balances$ = this._balances$.asObservable();

  private readonly _pendingBalances$ = new BehaviorSubject<
    | {
        address: string;
        amount: string;
        blockchain: BlockchainName;
      }[]
    | null
  >(null);

  public readonly pendingBalances$ = this._pendingBalances$.asObservable();

  private readonly railgunService = inject(RailgunService);

  constructor() {
    this.initializeRailgun();
  }

  private async initializeRailgun(): Promise<void> {
    await this.railgunService.initServices();
  }

  public onSubmit(account: PublicAccount): void {
    this._account$.next(account);
  }

  public onStepChange(step: StepType): void {
    this._currentStep$.next(step);
  }

  private async handleAccount(account: PublicAccount): Promise<void> {
    try {
      const walletInfo = await this.mnemonicService.createPrivateWallet(
        account.password,
        account.phrase,
        'Polygon' as RubicAny
      );
      console.log('[RAILGUN] Wallet info: ', walletInfo);
      this._railgunAccount$.next(walletInfo);
      this._currentStep$.next('hide' as RubicAny);
      await this.balanceController.refreshBalances({ type: 0, id: 137 }, [walletInfo.id]);
      this.balanceController.balancesSnapshot$.subscribe(update => {
        if (update?.Spendable) {
          const blockchain = BlockchainsInfo.getBlockchainNameById(update?.Spendable.chain.id);
          const tokens = update?.Spendable.erc20Amounts
            .filter(el => el.amount !== BigInt(0))
            .map(token => ({
              blockchain,
              address: token.tokenAddress,
              amount: new BigNumber(token.amount.toString()).toFixed()
            }));
          this._balances$.next(tokens);
        } else {
          this._balances$.next([]);
        }
        if (update?.ShieldPending) {
          const blockchain = BlockchainsInfo.getBlockchainNameById(update?.ShieldPending.chain.id);
          const tokens = update?.ShieldPending.erc20Amounts
            .filter(el => el.amount !== BigInt(0))
            .map(token => ({
              blockchain,
              address: token.tokenAddress,
              amount: new BigNumber(token.amount.toString()).toFixed()
            }));
          this._pendingBalances$.next(tokens);
        }
      });
    } catch (error) {
      console.warn(error);
    }
  }

  public logout(): void {
    this._account$.next(null);
    this._railgunAccount$.next(null);
    this._balances$.next([]);
    this._currentStep$.next('connectWallet');
  }
}
