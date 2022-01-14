import { ContractAddressNetMode } from '@shared/models/blockchain/net-mode';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { UniswapV3Constants } from '@features/instant-trade/services/instant-trade-service/providers/common/uniswap-v3/models/uniswap-v3-constants';

const wethAddressNetMode: ContractAddressNetMode = {
  mainnet: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  testnet: '0xd0a1e359811322d97991e03f863a0c30c2cf029c'
};

export const UNI_SWAP_V3_CONSTANTS: UniswapV3Constants = {
  blockchain: BLOCKCHAIN_NAME.ETHEREUM,
  wethAddressNetMode
};
