import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { BlockchainItem } from '../models/BlockchainItem';

const imageBaseSrc = 'assets/images/icons/coins/';

export const blockchainsList: BlockchainItem[] = [
  {
    symbol: BLOCKCHAIN_NAME.ETHEREUM,
    visibleName: 'Ethereum',
    image: `${imageBaseSrc}eth.svg`,
    id: 1
  },
  {
    symbol: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    visibleName: 'BSC',
    image: `${imageBaseSrc}bnb.svg`,
    id: 56
  },
  {
    symbol: BLOCKCHAIN_NAME.POLYGON,
    visibleName: 'Polygon',
    image: `${imageBaseSrc}polygon.svg`,
    id: 137
  },
  {
    symbol: BLOCKCHAIN_NAME.XDAI,
    visibleName: 'XDai',
    image: `${imageBaseSrc}xdai.svg`,
    id: 100
  },
  {
    symbol: BLOCKCHAIN_NAME.TRON,
    visibleName: 'Tron',
    image: `${imageBaseSrc}tron.svg`,
    id: null
  }
];
