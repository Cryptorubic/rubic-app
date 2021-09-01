import { ethereumTestTokens } from 'src/test/tokens/blockchain-tokens/ethereum-test-tokens';
import { bscTestTokens } from 'src/test/tokens/blockchain-tokens/bsc-test-tokens';
import { polygonTestTokens } from 'src/test/tokens/blockchain-tokens/polygon-test-tokens';

export const coingeckoTestTokens = [...ethereumTestTokens, ...bscTestTokens, ...polygonTestTokens];
