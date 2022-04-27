export interface LpProvidingConfig {
  contractAddress: string;
  brbcAddress: string;
  usdcAddress: string;
  minEnterAmount: number;
  maxEnterAmount: number;
  poolSize: number;
  poolUSDC: number;
  poolBRBC: number;
  maxEnterAmountWhitelist: number;
  whitelistDuration: number;
  whitelist: string[];
}

export const LP_PROVIDING_CONFIG_PROD: LpProvidingConfig = {
  contractAddress: '0x3b44bF53d1f704D25048871C44d39A4f9a2d3108',
  brbcAddress: '0x8E3BCC334657560253B83f08331d85267316e08a',
  usdcAddress: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
  minEnterAmount: 20,
  maxEnterAmount: 200,
  poolSize: 400,
  poolUSDC: 100,
  poolBRBC: 400,
  maxEnterAmountWhitelist: 32,
  whitelistDuration: 10800,
  whitelist: [
    '0x105a3ba3637a29d36f61c7f03f55da44b4591cd1',
    '0x60a4dae96386e8c6d8535f2463a00b4a40fae6ef'
  ]
};

export const LP_PROVIDING_CONFIG_DEVELOP: LpProvidingConfig = {
  contractAddress: '0x66317Db99447B801410375A5D3f6F839aBe89Aec',
  brbcAddress: '0x8E3BCC334657560253B83f08331d85267316e08a',
  usdcAddress: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
  minEnterAmount: 20,
  maxEnterAmount: 200,
  poolSize: 400,
  poolUSDC: 100,
  poolBRBC: 400,
  maxEnterAmountWhitelist: 32,
  whitelistDuration: 600,
  whitelist: [
    '0x3483ed7d3444a311a7585f0e59c9a74d6c111218',
    '0x8796e04d35ba0251fa71d9bc89937bed766970e3'
  ]
};
