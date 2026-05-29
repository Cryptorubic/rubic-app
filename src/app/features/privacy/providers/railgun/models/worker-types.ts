import {
  NetworkName,
  RailgunERC20AmountRecipient,
  TXIDVersion,
  TransactionGasDetails,
  RailgunWalletInfo
} from '@railgun-community/shared-models';
import { ContractTransaction } from 'ethers';
import { PrivacySupportedNetworks } from '@features/privacy/providers/railgun/models/supported-networks';

/**
 * Common Types
 */
export type GasEstimateResponse = { gasEstimate: bigint };
export type PopulateResponse = { transaction: ContractTransaction; nullifiers: string[] };

/**
 * Auth & Wallet
 */
export type SetupFromPasswordRequest = string;
export type SetupFromPasswordResponse = string;

export type UnlockFromPasswordRequest = { password: string };
export type UnlockFromPasswordResponse = string;

export type CreatePrivateWalletRequest = {
  phrase: string;
  blockchain: PrivacySupportedNetworks;
  encryptionKey: string;
};
export type CreatePrivateWalletResponse = RailgunWalletInfo;

export type LoadWalletRequest = { railgunId: string; password: string };
export type LoadWalletResponse = RailgunWalletInfo;

export type WalletCredentialsRequest = { password: string; walletId: string };
export type GetEvmWalletResponse = string;
export type GetMnemonicResponse = string;

/**
 * Shielding
 */
export type GasEstimateForShieldRequest = {
  txIdVersion: TXIDVersion;
  network: PrivacySupportedNetworks;
  shieldPrivateKey: string;
  erc20AmountRecipients: RailgunERC20AmountRecipient[];
  nftAmountRecipients: unknown[];
  fromWalletAddress: string;
};

export type GasEstimateForShieldNativeRequest = Omit<
  GasEstimateForShieldRequest,
  'nftAmountRecipients'
> & {
  railgunAddress: string;
};

export type PopulateShieldRequest = Omit<GasEstimateForShieldRequest, 'fromWalletAddress'> & {
  gasDetails: TransactionGasDetails;
};

export type PopulateShieldNativeRequest = Omit<
  GasEstimateForShieldNativeRequest,
  'fromWalletAddress'
> & {
  gasDetails: TransactionGasDetails;
};

/**
 * Unshield & Transfer
 */
export type TransactionRequest = {
  txIdVersion: TXIDVersion;
  network: NetworkName | PrivacySupportedNetworks;
  walletId: string;
  password?: string;
  erc20AmountRecipients: RailgunERC20AmountRecipient[];
  gasDetails?: TransactionGasDetails;
  overallBatchMinGasPrice?: bigint;
};

export type GasEstimateForUnshieldRequest = Required<
  Pick<
    TransactionRequest,
    'txIdVersion' | 'network' | 'walletId' | 'password' | 'gasDetails' | 'erc20AmountRecipients'
  >
>;

export type GenerateUnshieldProofRequest = Pick<
  TransactionRequest,
  'txIdVersion' | 'network' | 'walletId' | 'password' | 'erc20AmountRecipients'
>;

export type PopulateUnshieldRequest = Required<
  Pick<
    TransactionRequest,
    | 'txIdVersion'
    | 'network'
    | 'walletId'
    | 'erc20AmountRecipients'
    | 'gasDetails'
    | 'overallBatchMinGasPrice'
  >
>;

export type GasEstimateForTransferRequest = GasEstimateForUnshieldRequest;
export type GenerateTransferProofRequest = GenerateUnshieldProofRequest;
export type PopulateTransferRequest = PopulateUnshieldRequest;

export type RefreshBalancesRequest = {
  chain: { type: number; id: number };
  walletIds: string[];
};

export type GeneratePOIRequest = { network: PrivacySupportedNetworks; walletId: string };
