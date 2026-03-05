import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PublicAccount } from '@features/privacy/providers/railgun/models/public-account';
import { StepType } from '@features/privacy/providers/railgun/models/step';
import { RailgunFacadeService } from '@features/privacy/providers/railgun/services/railgun-facade.service';

@Component({
  selector: 'app-railgun-main-page',
  templateUrl: './railgun-main-page.component.html',
  styleUrls: ['./railgun-main-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RailgunMainPageComponent {
  private readonly railgunFacade = inject(RailgunFacadeService);

  private readonly _currentStep$ = new BehaviorSubject<StepType>('connectWallet');

  public readonly currentStep$ = this._currentStep$.asObservable();

  public readonly account$ = this.railgunFacade.account$;

  public readonly railgunAccount$ = this.railgunFacade.railgunAccount$;

  public readonly balances$ = this.railgunFacade.balances$;

  public readonly pendingBalances$ = this.railgunFacade.pendingBalances$;

  constructor() {
    this.initializeRailgun();
  }

  private async initializeRailgun(): Promise<void> {
    this.railgunFacade.initService();
  }

  public onSubmit(account: PublicAccount): void {
    this.railgunFacade.setAccount(account);
  }

  public onStepChange(step: StepType): void {
    this._currentStep$.next(step);
  }

  private async handleAccount(_account: PublicAccount): Promise<void> {
    // try {
    //   const walletInfo = await this.mnemonicService.createPrivateWallet(
    //     account.password,
    //     account.phrase,
    //     'Polygon' as RubicAny
    //   );
    //   console.log('[RAILGUN] Wallet info: ', walletInfo);
    //   this._railgunAccount$.next(walletInfo);
    //   this._currentStep$.next('hide' as RubicAny);
    //   await this.balanceController.refreshBalances({ type: 0, id: 137 }, [walletInfo.id]);
    //   this.balanceController.balancesSnapshot$.subscribe(update => {
    //     if (update?.Spendable) {
    //       const blockchain = BlockchainsInfo.getBlockchainNameById(update?.Spendable.chain.id);
    //       const tokens = update?.Spendable.erc20Amounts
    //         .filter(el => el.amount !== BigInt(0))
    //         .map(token => ({
    //           blockchain,
    //           address: token.tokenAddress,
    //           amount: new BigNumber(token.amount.toString()).toFixed()
    //         }));
    //       this._balances$.next(tokens);
    //     } else {
    //       this._balances$.next([]);
    //     }
    //     if (update?.ShieldPending) {
    //       const blockchain = BlockchainsInfo.getBlockchainNameById(update?.ShieldPending.chain.id);
    //       const tokens = update?.ShieldPending.erc20Amounts
    //         .filter(el => el.amount !== BigInt(0))
    //         .map(token => ({
    //           blockchain,
    //           address: token.tokenAddress,
    //           amount: new BigNumber(token.amount.toString()).toFixed()
    //         }));
    //       this._pendingBalances$.next(tokens);
    //     }
    //   });
    // } catch (error) {
    //   console.warn(error);
    // }
  }

  public logout(): void {
    // this._account$.next(null);
    // this._railgunAccount$.next(null);
    // this._balances$.next([]);
    // this._currentStep$.next('connectWallet');
  }
}
