import Web3 from 'web3';
import { InfuraProvider } from '@ethersproject/providers';
// @ts-ignore
import config from '../../../test/enviroment.test.json';

/**
 * Stub for unit tests.
 */
export default () => {
  const web3 = new Web3(config.providerLink);
  web3.eth.accounts.wallet.add(config.testWallet.privateKey);
  return {
    web3,
    connection: config.providerLink,
    address: config.testWallet.address,
    defaultMockGas: '400000',
    ethersProvider: new InfuraProvider('kovan'),
    isProduction: false
  };
};
