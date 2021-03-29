import { List } from 'immutable';
import { BridgeToken } from '../../app/features/bridge-page/models/BridgeToken';

const RBC: BridgeToken = {
  name: 'Rubic',
  symbol: 'RBC',
  ethSymbol: 'RBC',
  bscSymbol: 'WRBC',
  icon:
    'https://raw.githubusercontent.com/MyWishPlatform/etherscan_top_tokens_images/master/fa-empire.png',
  minAmount: 200,
  maxAmount: 100000,
  bscContractAddress: '0xd51bd30a91f88dcf72acd45c8a1e7ae0066263e8',
  bscContractDecimal: 18,
  ethContractAddress: '0xc5228008c89dfb03937ff5ff9124f0d7bd2028f9',
  ethContractDecimal: '18',
  ethToBscFee: 5,
  bscToEthFee: 100
};

export const bridgeTestTokens = List([RBC]);
