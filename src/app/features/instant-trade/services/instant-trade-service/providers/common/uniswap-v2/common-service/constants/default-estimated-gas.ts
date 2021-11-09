import BigNumber from 'bignumber.js';

export interface DefaultEstimatedGas {
  tokensToTokens: BigNumber[];
  tokensToEth: BigNumber[];
  ethToTokens: BigNumber[];
}

export const defaultEstimatedGas: DefaultEstimatedGas = {
  tokensToTokens: [
    new BigNumber(120_000),
    new BigNumber(220_000),
    new BigNumber(300_000),
    new BigNumber(400_000)
  ],
  tokensToEth: [
    new BigNumber(150_000),
    new BigNumber(240_000),
    new BigNumber(320_000),
    new BigNumber(400_000)
  ],
  ethToTokens: [
    new BigNumber(150_000),
    new BigNumber(240_000),
    new BigNumber(320_000),
    new BigNumber(400_000)
  ]
};
