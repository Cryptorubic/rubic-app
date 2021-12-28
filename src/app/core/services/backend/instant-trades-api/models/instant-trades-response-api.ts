import InputToken from '@shared/models/tokens/input-token';
import { InstantTradeProvider } from '@shared/models/instant-trade/instant-trade-provider';
import { TransactionStatus } from '@shared/models/blockchain/transaction-status';

interface InstantTradesBlockchainNetwork {
  title: string;
}

interface InstantTradesEthLikeContract {
  name: InstantTradeProvider | 'pancakeswap_old';
  address: string;
  blockchain_network: InstantTradesBlockchainNetwork;
}

interface SolanaITContract {
  name: InstantTradeProvider;
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
  status: TransactionStatus;
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
