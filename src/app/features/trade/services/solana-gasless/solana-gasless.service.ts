import { Injectable } from '@angular/core';
import { SwapFormInput } from '../../models/swap-form-controls';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import { SolanaGaslessStateService } from './solana-gasless-state.service';
import { HttpService } from '@app/core/services/http/http.service';
import { firstValueFrom, takeUntil } from 'rxjs';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { BLOCKCHAIN_NAME, CHAIN_TYPE } from '@cryptorubic/core';

@Injectable()
export class SolanaGaslessService {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly solanaGaslessStateService: SolanaGaslessStateService,
    private readonly httpService: HttpService,
    private readonly destroy$: TuiDestroyService,
    private readonly walletConnectorService: WalletConnectorService
  ) {
    this.subscribeOnUserAddressChange();
  }

  public onSwapFormInputChanged(inputValue: SwapFormInput): void {
    const isSrcTokenSelected =
      inputValue.fromToken && inputValue.fromToken.blockchain === BLOCKCHAIN_NAME.SOLANA;
    const userAddress = this.walletConnectorService.address;
    if (
      userAddress &&
      isSrcTokenSelected &&
      this.solanaGaslessStateService.madeLessThan5Txs &&
      this.solanaGaslessStateService.showInfo
    ) {
      this.notificationsService.showSolanaGaslessInfo();
      this.solanaGaslessStateService.markInfoAsShown();
    }
  }

  public async updateGaslessTxCount24Hrs(userAddress: string): Promise<void> {
    if (!userAddress) {
      this.solanaGaslessStateService.setGaslessTxCount24hrs(0);
      return;
    }

    const txCount24Hrs = await firstValueFrom(
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

    this.solanaGaslessStateService.setGaslessTxCount24hrs(txCount24Hrs);
  }

  private subscribeOnUserAddressChange(): void {
    this.walletConnectorService.addressChange$
      .pipe(takeUntil(this.destroy$))
      .subscribe(userAddress => {
        const chainType = this.walletConnectorService.chainType;
        if (userAddress) this.solanaGaslessStateService.markInfoAsNotShown();
        if (chainType === CHAIN_TYPE.SOLANA) {
          this.updateGaslessTxCount24Hrs(userAddress);
        } else {
          this.solanaGaslessStateService.setGaslessTxCount24hrs(0);
        }
      });
  }
}
