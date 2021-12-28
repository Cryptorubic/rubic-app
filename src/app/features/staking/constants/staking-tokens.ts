import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';

export const STAKING_TOKENS = [
  {
    name: 'Rubic',
    symbol: 'BRBC',
    image: 'assets/images/icons/staking/brbc-bsc.svg',
    address: '0x8e3bcc334657560253b83f08331d85267316e08a', //testnet
    // mainnet 0x8E3BCC334657560253B83f08331d85267316e08a
    blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
  },
  {
    name: 'Rubic',
    symbol: 'RBC',
    image: 'assets/images/icons/staking/rbc-eth.svg',
    address: '0xA4EED63db85311E22dF4473f87CcfC3DaDCFA3E3', //mainnet
    blockchain: BLOCKCHAIN_NAME.ETHEREUM
  },
  {
    name: 'Rubic (PoS)',
    symbol: 'RBC',
    image: 'assets/images/icons/staking/rbc-pos.svg',
    address: '0xc3cFFDAf8F3fdF07da6D5e3A89B8723D5E385ff8', //mainnet
    blockchain: BLOCKCHAIN_NAME.POLYGON
  }
];
