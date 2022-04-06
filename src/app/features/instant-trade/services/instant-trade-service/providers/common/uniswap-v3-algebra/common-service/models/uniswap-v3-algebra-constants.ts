import { EthLikeBlockchainName } from '@shared/models/blockchain/blockchain-name';
import { ContractData } from '@shared/models/blockchain/contract-data';

export interface UniswapV3AlgebraConstants {
  blockchain: EthLikeBlockchainName;
  wethAddress: string;
  swapRouterContract: ContractData;
}
