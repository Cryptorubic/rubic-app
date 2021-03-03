import Web3 from 'web3';
import { InfuraProvider } from '@ethersproject/providers';
// @ts-ignore
import config from '../../../test/enviroment.test.json';
import { BLOCKCHAIN_NAMES } from '../../pages/main-page/trades-form/types';

/**
 * Stub for unit tests.
 */
export default () => {
  const web3 = new Web3(config.providerLink);
  web3.eth.accounts.wallet.add(config.testWallet.privateKey);

  const INFURA_KOVAN_NETWORKS = {
    [BLOCKCHAIN_NAMES.ETHEREUM]: 'https://kovan.infura.io/v3/2e15c999e7854a6d9d95d7eb68b11ad6',
    [BLOCKCHAIN_NAMES.BINANCE_SMART_CHAIN]: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    [BLOCKCHAIN_NAMES.MATIC]: 'https://rpc-mumbai.maticvigil.com'
  };

  return {
    web3,
    connection: config.providerLink,
    address: config.testWallet.address,
    defaultMockGas: '400000',
    ethersProvider: new InfuraProvider('kovan'),
    web3Infura: {
      [BLOCKCHAIN_NAMES.ETHEREUM]: new Web3(INFURA_KOVAN_NETWORKS[BLOCKCHAIN_NAMES.ETHEREUM]),
      [BLOCKCHAIN_NAMES.BINANCE_SMART_CHAIN]: new Web3(
        INFURA_KOVAN_NETWORKS[BLOCKCHAIN_NAMES.BINANCE_SMART_CHAIN]
      ),
      [BLOCKCHAIN_NAMES.MATIC]: new Web3(INFURA_KOVAN_NETWORKS[BLOCKCHAIN_NAMES.MATIC])
    }
  };
};
