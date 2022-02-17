import { BLOCKCHAIN_NAME } from '@app/shared/models/blockchain/blockchain-name';
import { ENVIRONMENT } from 'src/environments/environment';

export const POOL_TOKENS = [
  {
    name: 'Rubic',
    symbol: 'BRBC',
    image: 'assets/images/icons/lp-providing/brbc.svg',
    address: ENVIRONMENT.lpProviding.brbcAddress,
    blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
  },
  {
    name: 'USD coin',
    symbol: 'USDC',
    image: 'assets/images/icons/lp-providing/usdc.svg',
    address: ENVIRONMENT.lpProviding.usdcAddress,
    blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
  }
];
