import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { INSTANT_TRADE_PROVIDER } from '@shared/models/instant-trade/instant-trade-provider';
import { ItProvider } from '@features/instant-trade/services/instant-trade-service/models/it-provider';

export type Providers = Partial<
  Record<BLOCKCHAIN_NAME, Partial<Record<INSTANT_TRADE_PROVIDER, ItProvider>>>
>;
