import { ContractAddressNetMode } from 'src/app/shared/models/blockchain/NetMode';
import { UniswapV2Constants } from 'src/app/features/instant-trade/services/instant-trade-service/models/uniswap-v2/UniswapV2Constants';

const sushiSwapHarmonyContracts: ContractAddressNetMode = {
  mainnet: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
  testnet: '0x1b02da8cb0d097eb8d57a175b88c7d8b47997506'
};

const wethAddressNetMode: ContractAddressNetMode = {
  mainnet: '0xcf664087a5bb0237a0bad6742852ec6c8d69a27a', // WONE https://explorer.harmony.one/
  testnet: '0xc0320368514b7961256d62bd7bc984623c0f7f65' // WONE https://explorer.pops.one/
};

const routingProvidersNetMode = {
  mainnet: [
    '0xcf664087a5bb0237a0bad6742852ec6c8d69a27a', // WONE
    '0xef977d2f931c1978db5f6747666fa1eacb0d0339', // DAI
    '0x985458e523db3d53125813ed68c274899e9dfab4', // USDC
    '0x3c2b8be99c50593081eaa2a724f0b8285f5aba8f', // USDT
    '0x3095c7557bcb296ccc6e363de01b760ba031f2d9' // WBTC
  ],
  testnet: [
    '0xc0320368514b7961256d62bd7bc984623c0f7f65' // WONE
  ]
};

export const sushiSwapHarmonyConstants: UniswapV2Constants = {
  contractAddressNetMode: sushiSwapHarmonyContracts,
  wethAddressNetMode,
  routingProvidersNetMode,
  maxTransitTokens: 2
};
