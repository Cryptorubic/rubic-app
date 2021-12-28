import {
  RoutingProvidersNetMode,
  UniswapV2Constants
} from '@features/instant-trade/services/instant-trade-service/models/uniswap-v2/uniswap-v2-constants';
import { ContractAddressNetMode } from '@shared/models/blockchain/net-mode';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';

const spiritSwapFantomContractAddressNetMode: ContractAddressNetMode = {
  mainnet: '0x16327E3FbDaCA3bcF7E38F5Af2599D2DDc33aE52',
  testnet: undefined
};

const wethAddressNetMode: ContractAddressNetMode = {
  mainnet: '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83',
  testnet: '0x1957d5e8496628d755a4b2151bca03ecc379bdd6'
};

const routingProvidersNetMode: RoutingProvidersNetMode = {
  mainnet: [
    { address: '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83', symbol: 'wFTM' },
    { address: '0x5cc61a78f164885776aa610fb0fe1257df78e59b', symbol: 'SPIRIT' },
    { address: '0x04068da6c83afcfa0e13ba15a6696662335d5b75', symbol: 'USDC' },
    { address: '0x049d68029688eAbF473097a2fC38ef61633A3C7A', symbol: 'fUSDT' },
    { address: '0x82f0b8b456c1a451378467398982d4834b6829c1', symbol: 'MIM' },
    { address: '0x321162Cd933E2Be498Cd2267a90534A804051b11', symbol: 'wBTC' },
    { address: '0x74b23882a30290451a17c44f4f05243b6b58c76d', symbol: 'wETH' }
  ],
  testnet: [{ address: '0x1957d5e8496628d755a4b2151bca03ecc379bdd6', symbol: 'wFTM' }]
};

export const SPIRIT_SWAP_FANTOM_CONSTANTS: UniswapV2Constants = {
  blockchain: BLOCKCHAIN_NAME.FANTOM,
  contractAddressNetMode: spiritSwapFantomContractAddressNetMode,
  wethAddressNetMode,
  routingProvidersNetMode,
  maxTransitTokens: 2
};
