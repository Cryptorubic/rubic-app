import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { TOKEN_RANK } from 'src/app/shared/models/tokens/token-rank';
import BigNumber from 'bignumber.js';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import { ETH, WEENUS, WSATT, XEENUS, YEENUS } from './eth-tokens';

const eth: TokenAmount = {
  name: 'Ethereum',
  symbol: ETH.symbol,
  blockchain: BLOCKCHAIN_NAME.ETHEREUM,
  address: ETH.address,
  decimals: ETH.decimals,
  image: 'https://dev-api.rubic.exchange/media/token_images/cg_logo_CHOP_Porkchop.png',
  rank: TOKEN_RANK.HIGH,
  price: 1705,
  usedInIframe: true,
  amount: new BigNumber(0)
};

const weenus: TokenAmount = {
  name: 'Weenus',
  symbol: WEENUS.symbol,
  blockchain: BLOCKCHAIN_NAME.ETHEREUM,
  address: WEENUS.address,
  decimals: WEENUS.decimals,
  image: 'https://dev-api.rubic.exchange/media/token_images/cg_logo_CHOP_Porkchop.png',
  rank: TOKEN_RANK.LOW,
  price: 10,
  usedInIframe: true,
  amount: new BigNumber(0)
};

const yeenus: TokenAmount = {
  name: 'Yeenus',
  symbol: YEENUS.symbol,
  blockchain: BLOCKCHAIN_NAME.ETHEREUM,
  address: YEENUS.address,
  decimals: YEENUS.decimals,
  image: 'https://dev-api.rubic.exchange/media/token_images/cg_logo_CHOP_Porkchop.png',
  rank: TOKEN_RANK.LOW,
  price: 50,
  usedInIframe: true,
  amount: new BigNumber(0)
};

const xeenus: TokenAmount = {
  name: 'Xeenus',
  symbol: XEENUS.symbol,
  blockchain: BLOCKCHAIN_NAME.ETHEREUM,
  address: XEENUS.address,
  decimals: XEENUS.decimals,
  image: 'https://dev-api.rubic.exchange/media/token_images/cg_logo_CHOP_Porkchop.png',
  rank: TOKEN_RANK.LOW,
  price: 2,
  usedInIframe: true,
  amount: new BigNumber(0)
};

const wsatt: TokenAmount = {
  name: 'Wsatt',
  symbol: WSATT.symbol,
  blockchain: BLOCKCHAIN_NAME.ETHEREUM,
  address: WSATT.address,
  decimals: WSATT.decimals,
  image: 'https://dev-api.rubic.exchange/media/token_images/cg_logo_CHOP_Porkchop.png',
  rank: TOKEN_RANK.LOW,
  price: 5,
  usedInIframe: true,
  amount: new BigNumber(0)
};

const rbc: TokenAmount = {
  name: 'Rubic',
  symbol: 'RBC',
  blockchain: BLOCKCHAIN_NAME.ETHEREUM,
  address: '0xc5228008c89dfb03937ff5ff9124f0d7bd2028f9',
  decimals: 18,
  image: 'https://dev-api.rubic.exchange/media/token_images/cg_logo_CHOP_Porkchop.png',
  rank: 6,
  price: 6,
  usedInIframe: true,
  amount: new BigNumber(0)
};

const bnb: TokenAmount = {
  name: 'Binance Coin',
  symbol: 'BNB',
  blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
  address: '0x0000000000000000000000000000000000000000',
  decimals: 18,
  image: 'https://dev-api.rubic.exchange/media/token_images/cg_logo_CHOP_Porkchop.png',
  rank: 1,
  price: 1,
  usedInIframe: true,
  amount: new BigNumber(0)
};

const wrbc: TokenAmount = {
  name: 'Wrapped Rubic',
  symbol: 'BRBC',
  blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
  address: '0xd51bd30a91f88dcf72acd45c8a1e7ae0066263e8',
  decimals: 18,
  image: 'https://dev-api.rubic.exchange/media/token_images/cg_logo_CHOP_Porkchop.png',
  rank: 2,
  price: 2,
  usedInIframe: true,
  amount: new BigNumber(0)
};

const matic: TokenAmount = {
  name: 'Matic',
  symbol: 'MATIC',
  blockchain: BLOCKCHAIN_NAME.POLYGON,
  address: '0x0000000000000000000000000000000000000000',
  decimals: 18,
  image: 'https://dev-api.rubic.exchange/media/token_images/cg_logo_CHOP_Porkchop.png',
  rank: 2,
  price: 2,
  usedInIframe: true,
  amount: new BigNumber(0)
};

export const coingeckoTestTokens = [eth, weenus, yeenus, xeenus, wsatt, rbc, bnb, wrbc, matic];
