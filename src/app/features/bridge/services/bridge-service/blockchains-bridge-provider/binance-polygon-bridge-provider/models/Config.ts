import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

export interface Config {
  tokenId: number;
  destination: BLOCKCHAIN_NAME;
  fee: BigNumber;
  feeBase: BigNumber;
  minAmount: BigNumber;
  maxAmount: BigNumber;
  directTransferAllowed: boolean;
}

export interface TokensIdConfig {
  [id: number]: Config;
}

export type BlockchainsConfig = {
  [blockchain in BLOCKCHAIN_NAME]?: TokensIdConfig;
};
