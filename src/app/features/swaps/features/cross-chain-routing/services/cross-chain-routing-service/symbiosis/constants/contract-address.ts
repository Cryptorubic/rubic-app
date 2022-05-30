import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';

export const SYMBIOSIS_CONTRACT_ADDRESS = {
  [BLOCKCHAIN_NAME.POLYGON]: '0x69A6762077c9489814d12F5e6DaC269EddFFb115'
};

export const SYMBIOSIS_SUPPORTED_BLOCKCHAINS = Object.keys(SYMBIOSIS_CONTRACT_ADDRESS);

export type SymbiosisSupportedBlockchain = keyof typeof SYMBIOSIS_CONTRACT_ADDRESS;
