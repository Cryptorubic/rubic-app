export const WRAP_SOL_ADDRESS = 'So11111111111111111111111111111111111111112';

export const swap_reserved_rent_fee = 0.0033;
export const deposit_rent_fee = 0.002;

export const addr_to_symbol_map: Record<string, string> = {
  [WRAP_SOL_ADDRESS.toLowerCase()]: 'sol',
  ['Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'.toLowerCase()]: 'usdt',
  ['EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'.toLowerCase()]: 'usdc'
};
