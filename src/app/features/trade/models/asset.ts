import { FiatAsset } from '@shared/models/fiats/fiat-asset';
import { BlockchainName } from 'rubic-sdk';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';

export type Asset = FiatAsset | AvailableTokenAmount;

export type AssetType = 'fiat' | 'allChains' | BlockchainName;
