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

type TokensInfoBodies = {
  [blockchain in BLOCKCHAIN_NAMES]: { [address: string]: TokenInfoBody };
};

export { Web3ApiNetwork, TokenInfoBody, TokensInfoBodies };
