import { ETH, WEENUS, WSATT, XEENUS, YEENUS } from './eth-tokens';
import { BackendToken } from '../../app/core/services/backend/tokens-service/models/BackendToken';
import { TokensListResponse } from '../../app/core/services/backend/tokens-service/models/TokensListResponse';

const eth: BackendToken = {
  token_title: 'Ethereum',
  token_short_title: ETH.symbol,
  platform: 'ethereum',
  address: ETH.address,
  decimals: ETH.decimals,
  image_link: 'https://devswaps.mywish.io/media/token_images/cg_logo_eth_ethereum_uibu3ky.png',
  coingecko_rank: 1,
  usd_price: 1705
};

const weenus: BackendToken = {
  token_title: 'Weenus',
  token_short_title: WEENUS.symbol,
  platform: 'ethereum',
  address: WEENUS.address,
  decimals: WEENUS.decimals,
  image_link:
    'https://raw.githubusercontent.com/MyWishPlatform/etherscan_top_tokens_images/master/fa-empire.png',
  coingecko_rank: 2,
  usd_price: 10
};

const yeenus: BackendToken = {
  token_title: 'Yeenus',
  token_short_title: YEENUS.symbol,
  platform: 'ethereum',
  address: YEENUS.address,
  decimals: YEENUS.decimals,
  image_link:
    'https://raw.githubusercontent.com/MyWishPlatform/etherscan_top_tokens_images/master/fa-empire.png',
  coingecko_rank: 3,
  usd_price: 50
};

const xeenus: BackendToken = {
  token_title: 'Xeenus',
  token_short_title: XEENUS.symbol,
  platform: 'ethereum',
  address: XEENUS.address,
  decimals: XEENUS.decimals,
  image_link:
    'https://raw.githubusercontent.com/MyWishPlatform/etherscan_top_tokens_images/master/fa-empire.png',
  coingecko_rank: 4,
  usd_price: 2
};

const wsatt: BackendToken = {
  token_title: 'Wsatt',
  token_short_title: WSATT.symbol,
  platform: 'ethereum',
  address: WSATT.address,
  decimals: WSATT.decimals,
  image_link:
    'https://raw.githubusercontent.com/MyWishPlatform/etherscan_top_tokens_images/master/fa-empire.png',
  coingecko_rank: 5,
  usd_price: 5
};

const tokens: BackendToken[] = [eth, weenus, yeenus, xeenus, wsatt];

export const backendTestTokens: TokensListResponse = {
  total: tokens.length,
  tokens
};
