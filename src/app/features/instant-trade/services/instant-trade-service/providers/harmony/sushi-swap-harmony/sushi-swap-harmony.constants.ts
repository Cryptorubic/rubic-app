import { ContractAddressNetMode } from '@shared/models/blockchain/net-mode';
import { UniswapV2Constants } from '@features/instant-trade/services/instant-trade-service/models/uniswap-v2/uniswap-v2-constants';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';

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
    { address: '0xcf664087a5bb0237a0bad6742852ec6c8d69a27a', symbol: 'WONE' },
    { address: '0xef977d2f931c1978db5f6747666fa1eacb0d0339', symbol: 'DAI' },
    { address: '0x985458e523db3d53125813ed68c274899e9dfab4', symbol: 'USDC' },
    { address: '0x3c2b8be99c50593081eaa2a724f0b8285f5aba8f', symbol: 'USDT' },
    { address: '0x3095c7557bcb296ccc6e363de01b760ba031f2d9', symbol: 'WBTC' }
  ],
  testnet: [{ address: '0xc0320368514b7961256d62bd7bc984623c0f7f65', symbol: 'WONE' }]
};

export const SUSHI_SWAP_HARMONY_CONSTANTS: UniswapV2Constants = {
  blockchain: BLOCKCHAIN_NAME.HARMONY,
  contractAddressNetMode: sushiSwapHarmonyContracts,
  wethAddressNetMode,
  routingProvidersNetMode,
  maxTransitTokens: 2
};
