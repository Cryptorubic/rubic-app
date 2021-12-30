import Web3 from 'web3';
import { BehaviorSubject } from 'rxjs';
// @ts-ignore
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { BlockchainData } from '@shared/models/blockchain/blockchain-data';
import * as config from 'src/test/enviroment.test.json';
import { BlockchainsInfo } from '@core/services/blockchain/blockchain-info';

/**
 * Stub for unit tests.
 */
export default () => {
  const web3 = new Web3(config.providerLink);
  web3.eth.accounts.wallet.add(config.testWallet.privateKey);

  return {
    web3,
    onAddressChanges$: new BehaviorSubject<string>(undefined),
    onNetworkChanges$: new BehaviorSubject<BlockchainData>(undefined),
    get address(): string {
      return config.testWallet.address;
    },
    get isInstalled(): boolean {
      return true;
    },
    get isActive(): boolean {
      return true;
    },
    get network(): BlockchainData {
      const eth = BlockchainsInfo.getBlockchainByName(BLOCKCHAIN_NAME.ETHEREUM);
      return {
        ...eth,
        id: 42
      };
    },
    get networkName(): BLOCKCHAIN_NAME {
      return this.network.name;
    },
    defaultGasLimit: '400000'
  };
};
