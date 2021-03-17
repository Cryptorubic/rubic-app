import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

const blockchainCode = 22;

export const BLOCKCHAINS = [
  {
    name: BLOCKCHAIN_NAME.ETHEREUM,
    code: blockchainCode,
    label: 'Ethereum',
    image: 'assets/images/icons/coins/eth.png'
  },
  {
    name: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    code: blockchainCode,
    label: 'Binance Smart Chain',
    image: 'assets/images/icons/coins/bnb.svg'
  },
  {
    name: BLOCKCHAIN_NAME.MATIC,
    code: blockchainCode,
    label: 'Matic',
    image: 'assets/images/icons/coins/matic.svg'
  }
];
