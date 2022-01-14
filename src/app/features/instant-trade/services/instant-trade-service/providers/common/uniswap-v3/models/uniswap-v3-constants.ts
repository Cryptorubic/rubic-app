import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { ContractAddressNetMode } from '@shared/models/blockchain/net-mode';

export interface UniswapV3Constants {
  blockchain: BLOCKCHAIN_NAME;
  wethAddressNetMode: ContractAddressNetMode;
}
