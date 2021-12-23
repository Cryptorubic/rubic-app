import { ContractAddressNetMode } from 'src/app/shared/models/blockchain/NetMode';
import { UniswapV2Constants } from 'src/app/features/instant-trade/services/instant-trade-service/models/uniswap-v2/UniswapV2Constants';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

const viperSwapHarmonyContracts: ContractAddressNetMode = {
  mainnet: '0xf012702a5f0e54015362cBCA26a26fc90AA832a3',
  testnet: '0x8e9A3cE409B13ef459fE4448aE97a79d6Ecd8b4b'
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
    { address: '0x3095c7557bcb296ccc6e363de01b760ba031f2d9', symbol: 'WBTC' },
    { address: '0x0dc78c79b4eb080ead5c1d16559225a46b580694', symbol: 'WAGMI' },
    { address: '0xea589e93ff18b1a1f1e9bac7ef3e86ab62addc79', symbol: 'VIPER' }
  ],
  testnet: [{ address: '0xc0320368514b7961256d62bd7bc984623c0f7f65', symbol: 'WONE' }]
};

export const viperSwapHarmonyConstants: UniswapV2Constants = {
  blockchain: BLOCKCHAIN_NAME.HARMONY,
  contractAddressNetMode: viperSwapHarmonyContracts,
  wethAddressNetMode,
  routingProvidersNetMode,
  maxTransitTokens: 2
};
