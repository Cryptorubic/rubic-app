import { ContractAddressNetMode } from '@shared/models/blockchain/net-mode';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import {
  RoutingProvidersNetMode,
  UniswapV2Constants
} from '@features/instant-trade/services/instant-trade-service/models/uniswap-v2/uniswap-v2-constants';

const sushiSwapContractAddressNetMode: ContractAddressNetMode = {
  mainnet: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
  testnet: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506'
};

const wethAddressNetMode: ContractAddressNetMode = {
  mainnet: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  testnet: '0xd0a1e359811322d97991e03f863a0c30c2cf029c'
};

const routingProvidersNetMode: RoutingProvidersNetMode = {
  mainnet: [
    { address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', symbol: 'WETH' },
    { address: '0xdac17f958d2ee523a2206206994597c13d831ec7', symbol: 'USDT' },
    { address: '0x6b175474e89094c44da98b954eedeac495271d0f', symbol: 'DAI' },
    { address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', symbol: 'USDC' }
  ],
  testnet: [
    { address: '0xd0a1e359811322d97991e03f863a0c30c2cf029c', symbol: 'WETH' },
    { address: '0x022e292b44b5a146f2e8ee36ff44d3dd863c915c', symbol: 'XEENUS' }
  ]
};

export const SUSHI_SWAP_ETH_CONSTANTS: UniswapV2Constants = {
  blockchain: BLOCKCHAIN_NAME.ETHEREUM,
  contractAddressNetMode: sushiSwapContractAddressNetMode,
  wethAddressNetMode,
  routingProvidersNetMode,
  maxTransitTokens: 1
};
