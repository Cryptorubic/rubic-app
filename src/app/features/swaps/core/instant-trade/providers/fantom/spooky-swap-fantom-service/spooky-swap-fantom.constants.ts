import { UniswapV2Constants } from '@features/swaps/core/instant-trade/providers/common/uniswap-v2/common-service/models/uniswap-v2-constants';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';

const spookySwapFantomContractAddress = '0xF491e7B69E4244ad4002BC14e878a34207E38c29';

const wethAddress = '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83';

const routingProviders = [
  { address: '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83', symbol: 'wFTM' },
  { address: '0x841fad6eae12c286d1fd18d1d525dffa75c7effe', symbol: 'BOO' },
  { address: '0x04068da6c83afcfa0e13ba15a6696662335d5b75', symbol: 'USDC' },
  { address: '0x74b23882a30290451a17c44f4f05243b6b58c76d', symbol: 'wETH' },
  { address: '0x321162Cd933E2Be498Cd2267a90534A804051b11', symbol: 'wBTC' },
  { address: '0x049d68029688eAbF473097a2fC38ef61633A3C7A', symbol: 'fUSDT' },
  { address: '0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e', symbol: 'DAI' }
];

export const SPOOKY_SWAP_FANTOM_CONSTANTS: UniswapV2Constants = {
  blockchain: BLOCKCHAIN_NAME.FANTOM,
  contractAddress: spookySwapFantomContractAddress,
  wethAddress,
  routingProviders,
  maxTransitTokens: 2
};
