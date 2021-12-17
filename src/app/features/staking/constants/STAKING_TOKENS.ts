import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/BLOCKCHAIN_NAME';

export const STAKING_TOKENS = [
  {
    name: 'Rubic',
    symbol: 'BRBC',
    image: 'assets/images/icons/staking/brbc-bsc.svg',
    address: '0xd51bd30A91F88Dcf72Acd45c8A1E7aE0066263e8', //testnet
    blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET
  },
  {
    name: 'Rubic',
    symbol: 'RBC',
    image: 'assets/images/icons/staking/rbc-eth.svg',
    address: '',
    blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET
  },
  {
    name: 'Rubic (PoS)',
    symbol: 'RBC',
    image: 'assets/images/icons/staking/rbc-pos.svg',
    address: '',
    blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET
  }
];
