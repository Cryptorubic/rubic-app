import {
  ContractAddressNetMode,
  RoutingProvidersNetMode,
  UniswapV2Constants,
  WethAddressNetMode
} from 'src/app/features/instant-trade/services/instant-trade-service/models/uniswap-v2/UniswapV2Constants';

const pancakeSwapContractAddressNetMode: ContractAddressNetMode = {
  mainnet: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
  testnet: '0xD99D1c33F9fC3444f8101754aBC46c52416550D1'
};

const wethAddressNetMode: WethAddressNetMode = {
  mainnet: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
  testnet: '0xae13d989dac2f0debff460ac112a837c89baa7cd'
};

const routingProvidersNetMode: RoutingProvidersNetMode = {
  mainnet: [
    '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', // WBNB
    '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82', // CAKE
    '0xe9e7cea3dedca5984780bafc599bd69add087d56', // BUSD
    '0xcf6bb5389c92bdda8a3747ddb454cb7a64626c63' // XVS
  ],
  testnet: [
    '0xae13d989dac2f0debff460ac112a837c89baa7cd', // WBNB
    '0x8babbb98678facc7342735486c851abd7a0d17ca' // ETH
  ]
};

const maxTransitTokens = 3;

export const pancakeSwapConstants: UniswapV2Constants = {
  contractAddressNetMode: pancakeSwapContractAddressNetMode,
  wethAddressNetMode,
  routingProvidersNetMode,
  maxTransitTokens
};
