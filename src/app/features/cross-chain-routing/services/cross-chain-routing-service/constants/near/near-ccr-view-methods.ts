import { BlockchainNumber } from '@features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/contract-data/models/blockchain-number';

export interface NearCcrViewMethods {
  get_min_token_amount: () => Promise<string>;
  get_max_token_amount: () => Promise<string>;
  get_fee_amount_of_blockchain: () => Promise<string>;
  get_blockchain_crypto_fee: (args: { blockchain_id: BlockchainNumber }) => Promise<string>;
  is_running: () => Promise<boolean>;
}

export const NEAR_CCR_VIEW_METHODS: ReadonlyArray<keyof NearCcrViewMethods> = [
  'get_min_token_amount',
  'get_max_token_amount',
  'get_fee_amount_of_blockchain',
  'get_blockchain_crypto_fee',
  'is_running'
];
