import { ETHEREUM_TEST_TOKENS } from 'src/test/tokens/blockchain-tokens/ethereum-test-tokens';
import { BSC_TEST_TOKENS } from 'src/test/tokens/blockchain-tokens/bsc-test-tokens';
import { POLYGON_TEST_TOKENS } from 'src/test/tokens/blockchain-tokens/polygon-test-tokens';

export const COINGECKO_TEST_TOKENS = [
  ...ETHEREUM_TEST_TOKENS,
  ...BSC_TEST_TOKENS,
  ...POLYGON_TEST_TOKENS
];
