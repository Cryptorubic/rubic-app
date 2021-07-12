import { TOKEN_RANK } from 'src/app/shared/models/tokens/TOKEN_RANK';
import { ETH, WEENUS, WSATT, XEENUS, YEENUS } from './eth-tokens';

const eth = {
  name: 'Ethereum',
  symbol: ETH.symbol,
  blockchain_network: 'ethereum',
  address: ETH.address,
  decimals: ETH.decimals,
  image: 'https://devswaps.mywish.io/media/token_images/cg_logo_eth_ethereum_uibu3ky.png',
  coingecko_id: '1',
  rank: TOKEN_RANK.HIGH,
  usd_price: 1705
};

const weenus = {
  name: 'Weenus',
  symbol: WEENUS.symbol,
  blockchain_network: 'ethereum',
  address: WEENUS.address,
  decimals: WEENUS.decimals,
  image:
    'https://raw.githubusercontent.com/MyWishPlatform/etherscan_top_tokens_images/master/fa-empire.png',
  coingecko_id: '2',
  rank: TOKEN_RANK.POPULAR,
  usd_price: 10
};

const yeenus = {
  name: 'Yeenus',
  symbol: YEENUS.symbol,
  blockchain_network: 'ethereum',
  address: YEENUS.address,
  decimals: YEENUS.decimals,
  image:
    'https://raw.githubusercontent.com/MyWishPlatform/etherscan_top_tokens_images/master/fa-empire.png',
  coingecko_id: '3',
  rank: TOKEN_RANK.TOP,
  usd_price: 50
};

const xeenus = {
  name: 'Xeenus',
  symbol: XEENUS.symbol,
  blockchain_network: 'ethereum',
  address: XEENUS.address,
  decimals: XEENUS.decimals,
  image:
    'https://raw.githubusercontent.com/MyWishPlatform/etherscan_top_tokens_images/master/fa-empire.png',
  coingecko_id: '4',
  rank: TOKEN_RANK.POPULAR + 1,
  usd_price: 2
};

const wsatt = {
  name: 'Wsatt',
  symbol: WSATT.symbol,
  blockchain_network: 'ethereum',
  address: WSATT.address,
  decimals: WSATT.decimals,
  image:
    'https://raw.githubusercontent.com/MyWishPlatform/etherscan_top_tokens_images/master/fa-empire.png',
  coingecko_id: '5',
  rank: TOKEN_RANK.POPULAR + 2,
  usd_price: 5
};

export const backendTestTokens = [eth, weenus, yeenus, xeenus, wsatt];
