import { BehaviorSubject } from 'rxjs';
import { IBlockchain } from 'src/app/shared/models/blockchain/IBlockchain';
import Web3 from 'web3';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import { WalletConnectAbstractProvider } from '@core/services/blockchain/providers/common/wallet-connect-abstract';

export class WalletConnectProvider extends WalletConnectAbstractProvider {
  constructor(
    web3: Web3,
    chainChange$: BehaviorSubject<IBlockchain>,
    accountChange$: BehaviorSubject<string>,
    errorsService: ErrorsService,
    availableMobileWallets?: string[]
  ) {
    const providerConfig = {
      bridge: 'https://bridge.walletconnect.org',
      qrcode: true,
      qrcodeModalOptions: {
        mobileLinks: availableMobileWallets
      }
    };
    super(web3, chainChange$, accountChange$, errorsService, providerConfig);
  }
}
