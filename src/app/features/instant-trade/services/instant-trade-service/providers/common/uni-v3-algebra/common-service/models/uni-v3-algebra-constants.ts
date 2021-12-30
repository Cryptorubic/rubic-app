import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { ContractAddressNetMode } from '@shared/models/blockchain/net-mode';
import { ContractData } from '@shared/models/blockchain/contract-data';

export interface UniV3AlgebraConstants {
  blockchain: BLOCKCHAIN_NAME;
  wethAddressNetMode: ContractAddressNetMode;
  swapRouterContract: ContractData;
  isAlgebra: boolean;
}
