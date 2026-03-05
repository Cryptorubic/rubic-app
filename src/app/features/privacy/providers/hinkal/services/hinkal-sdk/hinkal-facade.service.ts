import { Injectable } from '@angular/core';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { HinkalInstanceService } from './hinkal-instance.service';
import { HinkalSwapService } from './hinkal-swap.service';
import { HinkalBalanceService } from './hinkal-balance.service';
import { Observable, Subscription, switchMap } from 'rxjs';
import { EvmBlockchainName, TokenAmount } from '@cryptorubic/core';
import { waitFor } from '@cryptorubic/web3';

@Injectable()
export class HinkalFacadeService {
  private readonly subs: Subscription[] = [];

  constructor(
    private readonly walletConnectorService: WalletConnectorService,
    private readonly hinkalInstanceService: HinkalInstanceService,
    private readonly hinkalSwapService: HinkalSwapService,
    private readonly hinkalBalanceService: HinkalBalanceService
  ) {
    this.initSubs();
  }

  private initSubs(): void {
    const walletSub = this.subscribeOnAddressChanged().subscribe();

    this.subs.push(walletSub);
  }

  private async refreshBalancesAfterAction(): Promise<void> {
    await waitFor(2000);
    this.hinkalBalanceService.refreshBalances();
  }

  public async deposit(
    tokenAmount: TokenAmount<EvmBlockchainName>,
    receiverPrivateShieldedKey?: string
  ): Promise<void> {
    return this.hinkalSwapService
      .deposit(tokenAmount, receiverPrivateShieldedKey)
      .then(() => this.refreshBalancesAfterAction());
  }

  public async withdraw(token: TokenAmount<EvmBlockchainName>, receiver?: string): Promise<void> {
    return this.hinkalSwapService
      .withdraw(token, receiver)
      .then(() => this.refreshBalancesAfterAction());
  }

  public async transfer(
    token: TokenAmount<EvmBlockchainName>,
    receiverPrivateShieldedKey: string
  ): Promise<void> {
    return this.hinkalSwapService
      .privateTransfer(token, receiverPrivateShieldedKey)
      .then(() => this.refreshBalancesAfterAction());
  }

  private subscribeOnAddressChanged(): Observable<void> {
    return this.walletConnectorService.addressChange$.pipe(
      switchMap(address =>
        this.hinkalInstanceService
          .updateInstance(address, this.walletConnectorService.network as EvmBlockchainName)
          .then(() => this.hinkalBalanceService.refreshBalances())
      )
    );
  }

  public removeSubs(): void {
    this.subs.forEach(sub => sub.unsubscribe());
  }
}
