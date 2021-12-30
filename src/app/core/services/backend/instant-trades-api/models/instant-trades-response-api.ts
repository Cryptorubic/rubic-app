import InputToken from '@shared/models/tokens/input-token';
import { INSTANT_TRADES_PROVIDERS } from '@shared/models/instant-trade/instant-trade-providers';
import { TRANSACTION_STATUS } from '@shared/models/blockchain/transaction-status';

interface InstantTradesBlockchainNetwork {
  title: string;
}

interface InstantTradesEthLikeContract {
  name: INSTANT_TRADES_PROVIDERS | 'pancakeswap_old';
  address: string;
  blockchain_network: InstantTradesBlockchainNetwork;
}

interface SolanaITContract {
  name: INSTANT_TRADES_PROVIDERS;
  address: string;
  blockchain_network: {
    title: 'solana';
  };
}

interface InstantTradesTokenApi extends InputToken {
  blockchain_network: string;
  coingecko_id: string;
  usd_price: number;
}

export type InstantTradesResponseApi = {
  user: { username: string };
  from_token: InstantTradesTokenApi;
  to_token: InstantTradesTokenApi;
  from_amount: string;
  to_amount: string;
  gas_price: string;
  gas_limit: string;
  status: TRANSACTION_STATUS;
  status_updated_at: string;
} & (
  | {
      contract: InstantTradesEthLikeContract;
      hash: string;
    }
  | {
      program: SolanaITContract;
      signature: string;
    }
);
