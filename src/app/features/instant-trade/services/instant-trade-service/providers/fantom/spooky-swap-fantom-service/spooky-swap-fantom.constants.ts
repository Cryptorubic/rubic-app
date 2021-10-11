import {
  RoutingProvidersNetMode,
  UniswapV2Constants
} from 'src/app/features/instant-trade/services/instant-trade-service/models/uniswap-v2/UniswapV2Constants';
import { ContractAddressNetMode } from 'src/app/shared/models/blockchain/NetMode';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

const spookySwapFantomContractAddressNetMode: ContractAddressNetMode = {
  mainnet: '0xF491e7B69E4244ad4002BC14e878a34207E38c29',
  testnet: undefined
};

const wethAddressNetMode: ContractAddressNetMode = {
  mainnet: '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83',
  testnet: '0x1957d5e8496628d755a4b2151bca03ecc379bdd6'
};

const routingProvidersNetMode: RoutingProvidersNetMode = {
  mainnet: [
    '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83', // wFTM
    '0x841fad6eae12c286d1fd18d1d525dffa75c7effe', // BOO
    '0x04068da6c83afcfa0e13ba15a6696662335d5b75', // USDC
    '0x74b23882a30290451a17c44f4f05243b6b58c76d', // wETH
    '0x321162Cd933E2Be498Cd2267a90534A804051b11', // wBTC
    '0x049d68029688eAbF473097a2fC38ef61633A3C7A' // fUSDT
  ],
  testnet: [
    '0x1957d5e8496628d755a4b2151bca03ecc379bdd6' // wFTM
  ]
};

export const spookySwapFantomConstants: UniswapV2Constants = {
  blockchain: BLOCKCHAIN_NAME.FANTOM,
  contractAddressNetMode: spookySwapFantomContractAddressNetMode,
  wethAddressNetMode,
  routingProvidersNetMode,
  maxTransitTokens: 2
};
