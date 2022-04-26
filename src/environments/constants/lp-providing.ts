export const LP_PROVIDING_CONFIG_PROD = {
  contractAddress: '0x36684Be8C3980097Bf193795b94c14FA8569347e',
  brbcAddress: '0x8E3BCC334657560253B83f08331d85267316e08a',
  usdcAddress: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
  minEnterAmount: 500,
  maxEnterAmount: 5000,
  poolSize: 800000,
  maxEnterAmountWhitelist: 800,
  whitelistDuration: 86400, // 1 day
  whitelist: [
    '0x449ab89a9c1dee7822580dad3cb6c0852210793a',
    '0xcc513c5e4f396e68c15282cfa02d3e9c615cd714',
    '0x7c10f3fea375284c2c70dd05eac26e7ffc42242b'
  ]
};

export const LP_PROVIDING_CONFIG_DEVELOP = {
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
