import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { TOKEN_RANK } from 'src/app/shared/models/tokens/TOKEN_RANK';
import BigNumber from 'bignumber.js';
import { NATIVE_TOKEN_ADDRESS } from 'src/app/shared/constants/blockchain/NATIVE_TOKEN_ADDRESS';

export const ETH: TokenAmount = {
  name: 'Ethereum',
  symbol: 'ETH',
  blockchain: BLOCKCHAIN_NAME.ETHEREUM,
  address: NATIVE_TOKEN_ADDRESS,
  decimals: 18,
  image: 'https://dev-api.rubic.exchange/media/token_images/cg_logo_CHOP_Porkchop.png',
  rank: TOKEN_RANK.HIGH,
  price: 1705,
  usedInIframe: true,
  amount: new BigNumber(0)
};

export const WETH: TokenAmount = {
  name: 'Wrapped Ethereum',
  symbol: 'WETH',
  blockchain: BLOCKCHAIN_NAME.ETHEREUM,
  address: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
  decimals: 18,
  image: 'https://dev-api.rubic.exchange/media/token_images/cg_logo_CHOP_Porkchop.png',
  rank: TOKEN_RANK.HIGH,
  price: 1705,
  usedInIframe: true,
  amount: new BigNumber(0)
};

export const WEENUS: TokenAmount = {
  name: 'Weenus',
  symbol: 'WEENUS',
  blockchain: BLOCKCHAIN_NAME.ETHEREUM,
  address: '0xaff4481d10270f50f203e0763e2597776068cbc5',
  decimals: 18,
  image: 'https://dev-api.rubic.exchange/media/token_images/cg_logo_CHOP_Porkchop.png',
  rank: TOKEN_RANK.LOW,
  price: 10,
  usedInIframe: true,
  amount: new BigNumber(0)
};

export const YEENUS: TokenAmount = {
  name: 'Yeenus',
  symbol: 'YEENUS',
  blockchain: BLOCKCHAIN_NAME.ETHEREUM,
  address: '0xc6fde3fd2cc2b173aec24cc3f267cb3cd78a26b7',
  decimals: 8,
  image: 'https://dev-api.rubic.exchange/media/token_images/cg_logo_CHOP_Porkchop.png',
  rank: TOKEN_RANK.LOW,
  price: 50,
  usedInIframe: true,
  amount: new BigNumber(0)
};

export const XEENUS: TokenAmount = {
  name: 'Xeenus',
  symbol: 'XEENUS',
  blockchain: BLOCKCHAIN_NAME.ETHEREUM,
  address: '0x022E292b44B5a146F2e8ee36Ff44D3dd863C915c',
  decimals: 18,
  image: 'https://dev-api.rubic.exchange/media/token_images/cg_logo_CHOP_Porkchop.png',
  rank: TOKEN_RANK.LOW,
  price: 2,
  usedInIframe: true,
  amount: new BigNumber(0)
};

export const WSATT: TokenAmount = {
  name: 'Wsatt',
  symbol: 'WSATT',
  blockchain: BLOCKCHAIN_NAME.ETHEREUM,
  address: '0x93171f534715d36fAC7ED6b02A052671ee09Fc23',
  decimals: 18,
  image: 'https://dev-api.rubic.exchange/media/token_images/cg_logo_CHOP_Porkchop.png',
  rank: TOKEN_RANK.LOW,
  price: 5,
  usedInIframe: true,
  amount: new BigNumber(0)
};

export const RBC: TokenAmount = {
  name: 'Rubic',
  symbol: 'RBC',
  blockchain: BLOCKCHAIN_NAME.ETHEREUM,
  address: '0xc5228008c89dfb03937ff5ff9124f0d7bd2028f9',
  decimals: 18,
  image: 'https://dev-api.rubic.exchange/media/token_images/cg_logo_CHOP_Porkchop.png',
  rank: TOKEN_RANK.LOW,
  price: 6,
  usedInIframe: true,
  amount: new BigNumber(0)
};

export const ethereumTestTokens = [ETH, WETH, WEENUS, YEENUS, XEENUS, WSATT, RBC];
