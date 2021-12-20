import { bool, Layout, publicKey, str, struct, u64, u8, vec } from '@project-serum/borsh';
import { PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';

const bufferLayout = require('buffer-layout');

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

export const BlockchainLayout = struct([
  u8('key'),
  str('rubic_address'),
  u64('fee_amount'),
  u64('crypto_fee'),
  bool('is_active')
]);

export interface SolanaBlockchainConfig {
  key: number;
  rubic_address: string;
  fee_amount: BigNumber;
  crypto_fee: BigNumber;
  is_active: boolean;
}

export const SOLANA_CCR_LAYOUT = struct([
  u8('instructionNumber'),
  bufferLayout.nu64('blockchain'),
  bufferLayout.nu64('tokenInAmount'),
  vec(str(), 'secondPath'),
  bufferLayout.nu64('exactRbcTokenOut'),
  str('tokenOutMin'),
  str('newAddress'),
  bool('swapToCrypto'),
  u8('transferType')
]);

export const INSTRUCTION_NUMBER = struct([u8('instruction')]);

export const UUID = struct([bufferLayout.nu64('version'), bufferLayout.nu64('uuid')]);

export const SECOND_PATH = struct([str('firstString'), str('secondString')]);

export const VECTOR = struct([vec(str(), 'second_path')]);

export const FIRST_CCR_DATA_LAYOUT = struct([
  bufferLayout.nu64('blockchain'),
  bufferLayout.nu64('token_in_amount')
]);

export const swap_to_crypto = struct([bool('swap_to_crypto')]);

export const SECOND_CCR_DATA_LAYOUT = struct([
  bufferLayout.nu64('exact_rbc_token_out'),
  bufferLayout.nu64('token_out_min')
]);

export const TEST_LAYOUT = struct([
  bufferLayout.nu64('blockchain'),
  bufferLayout.nu64('token_in_amount'),
  bufferLayout.nu64('exact_rbc_token_out'),
  bufferLayout.nu64('token_out_min'),
  bool('swap_to_crypto')
]);
