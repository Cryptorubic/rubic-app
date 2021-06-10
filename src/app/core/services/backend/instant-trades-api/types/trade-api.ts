import InputToken from 'src/app/shared/models/tokens/InputToken';
import { PROVIDERS } from '../../../../../features/swaps-page-old/instant-trades/models/providers.enum';

interface InstantTradesBlockchainNetwork {
  title: string;
}

interface InstantTradesContract {
  name: string;
  address: string;
  blockchain_network: InstantTradesBlockchainNetwork;
}

interface InstantTradesTokenApi extends InputToken {
  blockchain_network: string;
  coingecko_id: string;
  usd_price: number;
}

export interface InstantTradesRequestApi {
  hash: string;
  provider: string;
  network: string;
}

export interface InstantTradesResponseApi {
  hash: string;
  contract: InstantTradesContract;
  user: { username: string };
  from_token: InstantTradesTokenApi;
  to_token: InstantTradesTokenApi;
  from_amount: string;
  to_amount: string;
  gas_price: string;
  gas_limit: string;
  status: string;
  status_updated_at: string;
}

interface InstantTradesOthersApi {
  hash: string;
  provider: PROVIDERS;
  network: string;
}

interface InstantTradesOneInchApi {
  hash: string;
  provider: PROVIDERS;
  network: string;
  from_token: string;
  to_token: string;
  from_amount: number;
  to_amount: number;
}

export type InstantTradesPostApi = InstantTradesOthersApi | InstantTradesOneInchApi;
