import { bool, Layout, publicKey, str, struct, u64, u8, vec } from '@project-serum/borsh';
import { PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';

export const BridgeConfig = struct([
  u8('key'),
  publicKey('owner'),
  publicKey('manager'),
  publicKey('transfer_mint'),
  publicKey('amm_program_id'),
  u64('num_of_this_blockchain'),
  u64('fee_amount_of_blockchain'),
  u64('blockchain_crypto_fee'),
  u64('min_confirmation'),
  u64('min_token_amount'),
  u64('max_token_amount'),
  u64('refund_slippage'),
  bool('is_paused')
]) as Layout<unknown>;

export type BridgeConfigData = {
  key: number;
  owner: PublicKey;
  manager: PublicKey;
  transfer_mint: PublicKey;
  num_of_this_blockchain: BigNumber;
  fee_amount_of_blockchain: BigNumber;
  blockchain_crypto_fee: BigNumber;
  min_confirmation: BigNumber;
  min_token_amount: BigNumber;
  max_token_amount: BigNumber;
  refund_slippage: BigNumber;
  is_paused: boolean;
};

export const CCR_DATA_LAYOUT = struct([
  u64('blockchain'),
  u64('token_in_amount'),
  vec<string>(struct([str('first_string'), str('second_string')]), 'second_path'),
  u64('exact_rbc_token_out'),
  u64('token_out_min'),
  str('new_address'),
  bool('swap_to_crypto')
]);
