import { BLOCKCHAIN_NAMES } from '../../pages/main-page/trades-form/types';

interface Web3ApiNetwork {
  id: number;
  name: string;
}

interface TokenInfoBody {
  decimals: number;
  name: string;
  symbol: string;

  platform?: string;
}

export { Web3ApiNetwork, TokenInfoBody };
