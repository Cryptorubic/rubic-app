import { ContractAddressNetMode } from '@shared/models/blockchain/net-mode';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import {
  RoutingProvidersNetMode,
  UniswapV2Constants
} from '@features/instant-trade/services/instant-trade-service/models/uniswap-v2/uniswap-v2-constants';

const sushiSwapContractAddressNetMode: ContractAddressNetMode = {
  mainnet: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
  testnet: null
};

const wethAddressNetMode: ContractAddressNetMode = {
  mainnet: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
  testnet: null
};

const routingProvidersNetMode: RoutingProvidersNetMode = {
  mainnet: [
    { address: '0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a', symbol: 'GMX' },
    { address: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8', symbol: 'USDC' },
    { address: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1', symbol: 'DAI' },
    { address: '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f', symbol: 'WBTC' }
  ],
  testnet: [null]
};

export const SUSHI_SWAP_ARBITRUM_CONSTANTS: UniswapV2Constants = {
  blockchain: BLOCKCHAIN_NAME.ARBITRUM,
  contractAddressNetMode: sushiSwapContractAddressNetMode,
  wethAddressNetMode,
  routingProvidersNetMode,
  maxTransitTokens: 1
};
