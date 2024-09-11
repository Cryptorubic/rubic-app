import { Injectable } from '@angular/core';
import { BlockchainAdapterFactoryService } from '@cryptorubic/adapter';
import { pureRpcList } from '@shared/constants/blockchain/pure-rpc-list';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { filter, tap } from 'rxjs/operators';
import { CHAIN_TYPE, WalletProvider, WalletProviderCore } from 'rubic-sdk';

@Injectable({
  providedIn: 'root'
})
export class SdkApiService {
  public readonly adaptersFactory = new BlockchainAdapterFactoryService(pureRpcList);

  constructor(private readonly walletConnectorService: WalletConnectorService) {
    this.walletConnectorService.addressChange$
      .pipe(
        filter(Boolean),
        tap(address => {
          const chainType = this.walletConnectorService.chainType as keyof WalletProvider;
          const provider = this.walletConnectorService.provider;
          const chainTypeMap = {
            [CHAIN_TYPE.EVM]: provider.wallet,
            [CHAIN_TYPE.TRON]: provider.wallet.tronWeb,
            [CHAIN_TYPE.SOLANA]: provider.wallet
          };
          const core = chainTypeMap?.[chainType];
          const walletProviderCore: WalletProviderCore = { address, core };
          this.adaptersFactory.connectWallet({ [chainType]: walletProviderCore });
        })
      )
      .subscribe();
  }
}
