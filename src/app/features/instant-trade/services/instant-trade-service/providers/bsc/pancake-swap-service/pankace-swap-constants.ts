import {
  RoutingProvidersNetMode,
  UniswapV2Constants
} from 'src/app/features/instant-trade/services/instant-trade-service/models/uniswap-v2/UniswapV2Constants';
import { ContractAddressNetMode } from 'src/app/shared/models/blockchain/NetMode';

const pancakeSwapContractAddressNetMode: ContractAddressNetMode = {
  mainnet: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
  testnet: '0xD99D1c33F9fC3444f8101754aBC46c52416550D1'
};

const wethAddressNetMode: ContractAddressNetMode = {
  mainnet: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
  testnet: '0xae13d989dac2f0debff460ac112a837c89baa7cd'
};

const routingProvidersNetMode: RoutingProvidersNetMode = {
  mainnet: [
    '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', // WBNB
    '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82', // CAKE
    '0xe9e7cea3dedca5984780bafc599bd69add087d56', // BUSD
    '0x55d398326f99059fF775485246999027B3197955', // USDT
    '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c', // BTCB
    '0x23396cF899Ca06c4472205fC903bDB4de249D6fC', // UST
    '0x2170Ed0880ac9A755fd29B2688956BD959F933F8', // ETH
    '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d' // USDC
  ],
  testnet: [
    '0xae13d989dac2f0debff460ac112a837c89baa7cd', // WBNB
    '0x8babbb98678facc7342735486c851abd7a0d17ca' // ETH
  ]
};

export const pancakeSwapConstants: UniswapV2Constants = {
  contractAddressNetMode: pancakeSwapContractAddressNetMode,
  wethAddressNetMode,
  routingProvidersNetMode,
  maxTransitTokens: 3
};
