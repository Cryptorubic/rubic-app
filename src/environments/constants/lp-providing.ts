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
  contractAddress: '0xF66529C45E1E80449afcBF656A779896A1aDA959',
  brbcAddress: '0x8E3BCC334657560253B83f08331d85267316e08a',
  usdcAddress: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
  minEnterAmount: 20,
  maxEnterAmount: 200,
  poolSize: 3200000,
  poolUSDC: 100,
  poolBRBC: 400,
  maxEnterAmountWhitelist: 32,
  whitelistDuration: 600,
  whitelist: [
    '0x3483ed7d3444a311a7585f0e59c9a74d6c111218',
    '0x186915891222add6e2108061a554a1f400a25cbd'
  ]
};
