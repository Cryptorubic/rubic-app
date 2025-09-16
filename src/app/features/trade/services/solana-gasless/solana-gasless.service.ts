import { Injectable } from '@angular/core';
import { SwapFormInput } from '../../models/swap-form-controls';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import { SolanaGaslessStateService } from './solana-gasless-state.service';
import { HttpService } from '@app/core/services/http/http.service';
import { firstValueFrom, interval, Subscription, switchMap, takeUntil } from 'rxjs';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { BLOCKCHAIN_NAME } from '@cryptorubic/core';

// refetch banners every 5 minutes
const REFETCH_AFTER = 60 * 5 * 1_000;

@Injectable()
export class SolanaGaslessService {
  private pollingSub: Subscription | null = null;

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly solanaGaslessStateService: SolanaGaslessStateService,
    private readonly httpService: HttpService,
    private readonly destroy$: TuiDestroyService,
    private readonly walletConnectorService: WalletConnectorService
  ) {
    this.walletConnectorService.addressChange$
      .pipe(
        switchMap(userAddress => this.fetchGaslessTxCount(userAddress)),
        takeUntil(this.destroy$)
      )
      .subscribe(count => {
        if (this.pollingSub) this.pollingSub.unsubscribe();
        const userAddress = this.walletConnectorService.address;
        this.pollingSub = this.pollGaslessTxCount(userAddress);

        this.solanaGaslessStateService.setGaslessTxCount24hrs(count);
        this.solanaGaslessStateService.markInfoAsNotShown();
      });
  }

  public onSwapFormInputChanged(inputValue: SwapFormInput): void {
    const isSrcTokenSelected =
      inputValue.fromToken && inputValue.fromToken.blockchain === BLOCKCHAIN_NAME.SOLANA;
    if (
      isSrcTokenSelected &&
      this.solanaGaslessStateService.madeLessThan5Txs &&
      this.solanaGaslessStateService.showInfo
    ) {
      this.notificationsService.showSolanaGaslessInfo();
      this.solanaGaslessStateService.markInfoAsShown();
    }
  }

  public pollGaslessTxCount(userAddress: string): Subscription {
    return interval(REFETCH_AFTER)
      .pipe(
        switchMap(() => this.fetchGaslessTxCount(userAddress)),
        takeUntil(this.destroy$)
      )
      .subscribe(count => this.solanaGaslessStateService.setGaslessTxCount24hrs(count));
  }

  private fetchGaslessTxCount(userAddress: string): Promise<number> {
    if (!userAddress) return Promise.resolve(0);

    return firstValueFrom(
      this.httpService.get<{ count: number }>(
        'v3/tmp/via_rubic_api_trades/get_user_solana_gasless_trades_for_last_24_hours',
        { user: userAddress }
      )
    )
      .then(resp => resp.count)
      .catch(err => {
        console.log('[SolanaGaslessService_fetchGaslessTxCount] err ==>', err);
        return 0;
      });
  }
}
