import { EthLikeBlockchainName } from '@shared/models/blockchain/blockchain-name';
import { ContractAddressNetMode } from '@shared/models/blockchain/net-mode';
import { ContractData } from '@shared/models/blockchain/contract-data';

export interface UniswapV3AlgebraConstants {
  blockchain: EthLikeBlockchainName;
  wethAddressNetMode: ContractAddressNetMode;
  swapRouterContract: ContractData;
}
