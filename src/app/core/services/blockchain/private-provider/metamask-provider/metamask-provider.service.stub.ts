import Web3 from 'web3';
import { BehaviorSubject } from 'rxjs';
// @ts-ignore
import config from '../../../../../../test/enviroment.test.json';
import { BlockchainsInfo } from '../../blockchain-info';
import { BLOCKCHAIN_NAME } from '../../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import { IBlockchain } from '../../../../../shared/models/blockchain/IBlockchain';

/**
 * Stub for unit tests.
 */
export default () => {
  const web3 = new Web3(config.providerLink);
  web3.eth.accounts.wallet.add(config.testWallet.privateKey);

  return {
    web3,
    onAddressChanges: new BehaviorSubject<string>(undefined),
    onNetworkChanges: new BehaviorSubject<IBlockchain>(undefined),
    get address() {
      return config.testWallet.address;
    },
    get isInstalled() {
      return true;
    },
    get isActive() {
      return true;
    },
    get network() {
      const eth = BlockchainsInfo.getBlockchainByName(BLOCKCHAIN_NAME.ETHEREUM);
      return {
        ...eth,
        id: 42
      };
    },
    defaultGasLimit: '400000'
  };
};
