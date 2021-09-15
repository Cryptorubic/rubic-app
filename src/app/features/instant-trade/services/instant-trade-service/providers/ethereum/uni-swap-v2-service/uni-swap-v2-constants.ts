import {
  RoutingProvidersNetMode,
  UniswapV2Constants
} from 'src/app/features/instant-trade/services/instant-trade-service/models/uniswap-v2/UniswapV2Constants';
import { ContractAddressNetMode } from 'src/app/shared/models/blockchain/NetMode';

const uniSwapContractAddressNetMode: ContractAddressNetMode = {
  mainnet: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  testnet: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
};

const wethAddressNetMode: ContractAddressNetMode = {
  mainnet: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  testnet: '0xd0a1e359811322d97991e03f863a0c30c2cf029c'
};

const factoryAddressNetMode: ContractAddressNetMode = {
  mainnet: '0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f',
  testnet: '0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f'
};

const routingProvidersNetMode: RoutingProvidersNetMode = {
  mainnet: [
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
    '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
    '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' // USDC
  ],
  testnet: [
    '0xd0a1e359811322d97991e03f863a0c30c2cf029c', // WETH
    '0x022e292b44b5a146f2e8ee36ff44d3dd863c915c' // XEENUS
  ]
};

export const uniSwapV2Constants: UniswapV2Constants = {
  contractAddressNetMode: uniSwapContractAddressNetMode,
  wethAddressNetMode,
  factoryAddressNetMode,
  routingProvidersNetMode,
  maxTransitTokens: 2,
  lpFee: 0.003
};
