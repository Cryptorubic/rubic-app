import { Web3Public } from 'src/app/core/services/blockchain/web3-public-service/Web3Public';
import BigNumber from 'bignumber.js';

export type GasCalculationMethod = (
  amountIn: string,
  amountOutMin: string,
  path: string[],
  deadline: number,
  contractAddress: string,
  web3Public: Web3Public,
  isEnoughBalanceAndAllowance: boolean,
  tokensToEthEstimatedGas: BigNumber[]
) => Promise<BigNumber>;
