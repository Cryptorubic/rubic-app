import Web3 from 'web3';
import {InfuraProvider} from '@ethersproject/providers';

const alice = {
    address: '0x3aEC01681910210dD33a3687AA4585fd4d200A1c',
    privateKey: 'eeeb77b9401cb7655de8ae508d207bb0e38bddf196c310fa6b65675a1f2166aa'
};

const providerLink = 'https://kovan.infura.io/v3/9e85c637c9204e6f9779354562fcde7d';

/**
 * Stub for unit tests.
 */
export default () => {
    const web3 = new Web3(providerLink);
    web3.eth.accounts.wallet.add(alice.privateKey);
    return ({
        web3,
        connection: providerLink,
        address: alice.address,
        defaultMockGas: '400000',
        ethersProvider:  new InfuraProvider('kovan')
    });
};

