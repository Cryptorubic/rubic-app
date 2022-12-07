import { FiatAsset } from '@features/swaps/core/services/fiats-selector-service/models/fiat-asset';
import { BlockchainName } from 'rubic-sdk';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';

export type FromAsset = FiatAsset | AvailableTokenAmount;

export type FromAssetType = 'fiat' | BlockchainName;
