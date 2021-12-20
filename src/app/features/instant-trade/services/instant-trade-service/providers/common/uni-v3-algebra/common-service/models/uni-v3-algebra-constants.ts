import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/BLOCKCHAIN_NAME';
import { ContractAddressNetMode } from '@shared/models/blockchain/NetMode';
import { ContractData } from '@shared/models/blockchain/ContractData';

export interface UniV3AlgebraConstants {
  blockchain: BLOCKCHAIN_NAME;
  wethAddressNetMode: ContractAddressNetMode;
  swapRouterContract: ContractData;
  isAlgebra: boolean;
}
