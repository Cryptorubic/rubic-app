import InputToken from '@shared/models/tokens/input-token';
import { INSTANT_TRADE_PROVIDER } from '@features/swaps/shared/models/instant-trade-provider';
import { TRANSACTION_STATUS } from '@shared/models/blockchain/transaction-status';
import { FromBackendBlockchain } from '@shared/constants/blockchain/backend-blockchains';

interface InstantTradesBlockchainNetwork {
  title: string;
}

interface InstantTradesEthLikeContract {
  name: INSTANT_TRADE_PROVIDER;
  address: string;
  blockchain_network: InstantTradesBlockchainNetwork;
}

interface SolanaITContract {
  name: INSTANT_TRADE_PROVIDER;
  address: string;
  blockchain_network: {
    title: 'solana';
  };
}

interface InstantTradesTokenApi extends InputToken {
  blockchain_network: FromBackendBlockchain;
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
