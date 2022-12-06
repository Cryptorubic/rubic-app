import { FiatAsset } from '@features/swaps/core/services/fiats-selector-service/models/fiat-asset';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { BlockchainName } from 'rubic-sdk';

export type FromAsset = FiatAsset | TokenAmount;

export type FromAssetType = 'fiat' | BlockchainName;
