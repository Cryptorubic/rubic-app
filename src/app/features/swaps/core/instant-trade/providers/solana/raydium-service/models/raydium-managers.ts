import { RaydiumStableManager } from '@features/swaps/core/instant-trade/providers/solana/raydium-service/utils/raydium-stable-manager';
import { RaydiumSwapManager } from '@features/swaps/core/instant-trade/providers/solana/raydium-service/utils/raydium-swap-manager';
import { RaydiumWrapManager } from '@features/swaps/core/instant-trade/providers/solana/raydium-service/utils/raydium-wrap-manager';
import { RaydiumRouterManager } from '@features/swaps/core/instant-trade/providers/solana/raydium-service/utils/raydium-router-manager';
import { RaydiumLiquidityManager } from '@features/swaps/core/instant-trade/providers/solana/raydium-service/utils/raydium-liquidity-manager';

export type RaydiumManagers = [
  RaydiumStableManager,
  RaydiumSwapManager,
  RaydiumWrapManager,
  RaydiumRouterManager,
  RaydiumLiquidityManager
];
