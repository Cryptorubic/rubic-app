import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { NATIVE_TOKEN_ADDRESS } from '@shared/constants/blockchain/NATIVE_TOKEN_ADDRESS';
import BigNumber from 'bignumber.js';

const MATIC: TokenAmount = {
  name: 'Matic',
  symbol: 'MATIC',
  blockchain: BLOCKCHAIN_NAME.POLYGON,
  address: NATIVE_TOKEN_ADDRESS,
  decimals: 18,
  image: 'https://dev-api.rubic.exchange/media/token_images/cg_logo_CHOP_Porkchop.png',
  rank: 2,
  price: 2,
  usedInIframe: true,
  amount: new BigNumber(0),
  favorite: true
};

const USDT: TokenAmount = {
  name: 'Tether USD',
  symbol: 'USDT',
  blockchain: BLOCKCHAIN_NAME.POLYGON,
  address: '0x5aeB1BBCB4f83FDf2c440028b7725BDD358a9AFc',
  decimals: 18,
  image: 'https://dev-api.rubic.exchange/media/token_images/cg_logo_CHOP_Porkchop.png',
  rank: 2,
  price: 2,
  usedInIframe: true,
  amount: new BigNumber(0),
  favorite: true
};

export const polygonTestTokens = [MATIC, USDT];
