import { AccountInfo, PublicKey } from '@solana/web3.js';
import { HttpClient } from '@angular/common/http';
import { SolanaWeb3Public } from '@core/services/blockchain/web3/web3-public-service/SolanaWeb3Public';
import {
  LIQUIDITY_POOLS,
  LiquidityPoolInfo
} from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/pools';
import {
  ACCOUNT_LAYOUT,
  AMM_INFO_LAYOUT,
  AMM_INFO_LAYOUT_STABLE,
  AMM_INFO_LAYOUT_V3,
  AMM_INFO_LAYOUT_V4,
  MINT_LAYOUT
} from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/structure';
import BigNumber from 'bignumber.js';
import { getBigNumber } from '@shared/utils/utils';
import { SolanaPrivateAdapterService } from '@core/services/blockchain/web3/web3-private-service/solana-private-adapter.service';
import { OpenOrders } from '@project-serum/serum';
import {
  LP_TOKENS,
  NATIVE_SOL,
  SolanaTokenInfo,
  TOKENS
} from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/tokens';
import {
  LIQUIDITY_POOL_PROGRAM_ID_V4,
  SERUM_PROGRAM_ID_V3
} from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/accounts';
import { List } from 'immutable';
import { TokenAmount } from '@shared/models/tokens/TokenAmount';
import { RubicAny } from '@shared/models/utility-types/rubic-any';

interface PublicKeyAccount {
  publicKey: PublicKey;
  account: AccountInfo<Buffer>;
}

type LiquidityPools = {
  [P: string]: LiquidityPoolInfo;
};

type PoolFnName =
  | 'poolCoinTokenAccount'
  | 'poolPcTokenAccount'
  | 'ammOpenOrders'
  | 'ammId'
  | 'lpMintAddress';

type PoolGetter = {
  [P in PoolFnName]: () => void;
};

interface BN {
  toNumber: () => number;
}

interface LayoutDecode {
  swapFeeNumerator: BN;
  swapFeeDenominator: BN;
  status: BN;
  needTakePnlCoin: BN;
  needTakePnlPc: BN;
}

export class RaydiumLiquidityManager {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly publicBlockchainAdapter: SolanaWeb3Public,
    private readonly privateBlockchainAdapter: SolanaPrivateAdapterService
  ) {}

  public static getAddressForWhat(
    address: string
  ): Partial<{ key: string; lpMintAddress: string; version: number }> {
    for (const pool of LIQUIDITY_POOLS) {
      for (const [key, value] of Object.entries(pool)) {
        if (key === 'lp') {
          if (value.mintAddress === address) {
            return {
              key: 'lpMintAddress',
              lpMintAddress: pool.lp.mintAddress,
              version: pool.version
            };
          }
        } else if (value === address) {
          return { key, lpMintAddress: pool.lp.mintAddress, version: pool.version };
        }
      }
    }

    return {};
  }

  public async requestInfos(
    fromSymbol: string,
    toSymbol: string,
    solanaTokens: List<TokenAmount>
  ): Promise<{ [p: string]: LiquidityPoolInfo }> {
    const ammAll = await this.privateBlockchainAdapter.getFilteredProgramAccountsAmmOrMarketCache(
      'amm',
      new PublicKey(LIQUIDITY_POOL_PROGRAM_ID_V4),
      [{ dataSize: AMM_INFO_LAYOUT_V4.span }]
    );

    const lpMintAddressList = ammAll.reduce((acc, curr) => {
      const ammLayout = AMM_INFO_LAYOUT_V4.decode(Buffer.from(curr.accountInfo.data));
      if (
        ammLayout.pcMintAddress.toString() === ammLayout.serumMarket.toString() ||
        ammLayout.lpMintAddress.toString() === '11111111111111111111111111111111'
      ) {
        return acc;
      }
      return [...acc, ammLayout.lpMintAddress.toString()];
    }, []);

    const lpMintListDecimals = await this.getLpMintListDecimals(lpMintAddressList);

    for (let indexAmmInfo = 0; indexAmmInfo < ammAll.length; indexAmmInfo += 1) {
      const ammInfo = AMM_INFO_LAYOUT_V4.decode(Buffer.from(ammAll[indexAmmInfo].accountInfo.data));
      const fromCoin =
        ammInfo.coinMintAddress.toString() === TOKENS.WSOL.mintAddress
          ? NATIVE_SOL.mintAddress
          : ammInfo.coinMintAddress.toString();
      const toCoin =
        ammInfo.pcMintAddress.toString() === TOKENS.WSOL.mintAddress
          ? NATIVE_SOL.mintAddress
          : ammInfo.pcMintAddress.toString();

      const tokens = solanaTokens.map(
        el =>
          ({
            symbol: el.symbol,
            name: el.name,
            mintAddress: el.address,
            decimals: el.decimals
          } as SolanaTokenInfo)
      );
      const coin = tokens.find(item => item.mintAddress === fromCoin);
      const pc = tokens.find(item => item.mintAddress === toCoin);

      if (!coin || !pc) {
        continue;
      }

      if (coin.mintAddress === TOKENS.WSOL.mintAddress) {
        coin.symbol = 'SOL';
        coin.name = 'SOL';
        coin.mintAddress = '11111111111111111111111111111111';
      }
      if (pc.mintAddress === TOKENS.WSOL.mintAddress) {
        pc.symbol = 'SOL';
        pc.name = 'SOL';
        pc.mintAddress = '11111111111111111111111111111111';
      }
      const lp = Object.values(LP_TOKENS).find(
        item => item.mintAddress === ammInfo.lpMintAddress
      ) ?? {
        symbol: `${coin.symbol}-${pc.symbol}`,
        name: `${coin.symbol}-${pc.symbol}`,
        coin,
        pc,
        mintAddress: ammInfo.lpMintAddress.toString(),
        decimals: lpMintListDecimals[ammInfo.lpMintAddress]
      };

      // eslint-disable-next-line no-await-in-loop
      const { publicKey } = await this.privateBlockchainAdapter.createAmmAuthority(
        new PublicKey(LIQUIDITY_POOL_PROGRAM_ID_V4)
      );

      // const market = marketToLayout[ammInfo.serumMarket];
      //
      // // eslint-disable-next-line no-await-in-loop
      // const serumVaultSigner = await PublicKey.createProgramAddress(
      //   [ammInfo.serumMarket.toBuffer(), market.vaultSignerNonce.toArrayLike(Buffer, 'le', 8)],
      //   new PublicKey(SERUM_PROGRAM_ID_V3)
      // );

      const itemLiquidity: LiquidityPoolInfo = {
        name: `${coin.symbol}-${pc.symbol}`,
        coin,
        pc,
        lp,
        version: 4,
        programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
        ammId: ammAll[indexAmmInfo].publicKey.toString(),
        ammAuthority: publicKey.toString(),
        ammOpenOrders: ammInfo.ammOpenOrders.toString(),
        ammTargetOrders: ammInfo.ammTargetOrders.toString(),
        ammQuantities: NATIVE_SOL.mintAddress,
        poolCoinTokenAccount: ammInfo.poolCoinTokenAccount.toString(),
        poolPcTokenAccount: ammInfo.poolPcTokenAccount.toString(),
        poolWithdrawQueue: ammInfo.poolWithdrawQueue.toString(),
        poolTempLpTokenAccount: ammInfo.poolTempLpTokenAccount.toString(),
        serumProgramId: SERUM_PROGRAM_ID_V3,
        serumMarket: ammInfo.serumMarket.toString(),
        serumBids: '461R7gK9GK1kLUXQbHgaW9L6PESQFSLGxKXahvcHEJwD' /* market.bids.toString() */,
        serumAsks: '461R7gK9GK1kLUXQbHgaW9L6PESQFSLGxKXahvcHEJwD' /* market.asks.toString() */,
        serumEventQueue:
          '461R7gK9GK1kLUXQbHgaW9L6PESQFSLGxKXahvcHEJwD' /* market.eventQueue.toString() */,
        serumCoinVaultAccount:
          '461R7gK9GK1kLUXQbHgaW9L6PESQFSLGxKXahvcHEJwD' /* market.baseVault.toString() */,
        serumPcVaultAccount:
          '461R7gK9GK1kLUXQbHgaW9L6PESQFSLGxKXahvcHEJwD' /* market.quoteVault.toString() */,
        serumVaultSigner:
          '461R7gK9GK1kLUXQbHgaW9L6PESQFSLGxKXahvcHEJwD' /* serumVaultSigner.toString() */,
        official: false
      };
      if (!LIQUIDITY_POOLS.find(item => item.ammId === itemLiquidity.ammId)) {
        LIQUIDITY_POOLS.push(itemLiquidity);
      } else {
        for (let itemIndex = 0; itemIndex < LIQUIDITY_POOLS.length; itemIndex += 1) {
          if (
            LIQUIDITY_POOLS[itemIndex].ammId === itemLiquidity.ammId &&
            LIQUIDITY_POOLS[itemIndex].name !== itemLiquidity.name &&
            !LIQUIDITY_POOLS[itemIndex].official
          ) {
            LIQUIDITY_POOLS[itemIndex] = itemLiquidity;
          }
        }
      }
    }

    const liquidityPools: { [K: string]: LiquidityPoolInfo } = {};
    const publicKeys: PublicKey[] = [];

    const LP = LIQUIDITY_POOLS.filter(
      pool => pool.name.includes(fromSymbol) || pool.name.includes(toSymbol)
    );

    LP.forEach(pool => {
      const { poolCoinTokenAccount, poolPcTokenAccount, ammOpenOrders, ammId, lp } = pool;

      publicKeys.push(
        new PublicKey(poolCoinTokenAccount),
        new PublicKey(poolPcTokenAccount),
        new PublicKey(ammOpenOrders),
        new PublicKey(ammId),
        new PublicKey(lp.mintAddress)
      );

      const poolInfo: LiquidityPoolInfo = { ...pool };

      poolInfo.coin.balance = new BigNumber(0);
      poolInfo.pc.balance = new BigNumber(0);

      liquidityPools[lp.mintAddress] = poolInfo;
    });

    const multipleInfo = await this.privateBlockchainAdapter.getMultipleAccounts(publicKeys);

    multipleInfo.forEach(info => {
      if (info) {
        const address = info.publicKey.toBase58();
        const data = Buffer.from(info.account.data);

        const { key, lpMintAddress, version } = RaydiumLiquidityManager.getAddressForWhat(address);

        if (key && lpMintAddress) {
          const poolInfo = liquidityPools[lpMintAddress];

          // eslint-disable-next-line default-case
          switch (key) {
            case 'poolCoinTokenAccount': {
              const parsed = ACCOUNT_LAYOUT.decode(data);
              // quick fix: Number can only safely store up to 53 bits
              poolInfo.coin.balance = poolInfo.coin.balance.plus(String(parsed.amount));

              break;
            }
            case 'poolPcTokenAccount': {
              const parsed = ACCOUNT_LAYOUT.decode(data);

              poolInfo.pc.balance = poolInfo.pc.balance.plus(String(parsed.amount));

              break;
            }
            case 'ammOpenOrders': {
              const OPEN_ORDERS_LAYOUT = OpenOrders.getLayout(
                new PublicKey(poolInfo.serumProgramId)
              );
              const parsed = OPEN_ORDERS_LAYOUT.decode(data);

              const { baseTokenTotal, quoteTokenTotal } = parsed;
              poolInfo.coin.balance = poolInfo.coin.balance.plus(String(baseTokenTotal));
              poolInfo.pc.balance = poolInfo.pc.balance.plus(String(quoteTokenTotal));

              break;
            }
            case 'ammId': {
              let parsed;
              if (version === 2) {
                parsed = AMM_INFO_LAYOUT.decode(data);
              } else if (version === 3) {
                parsed = AMM_INFO_LAYOUT_V3.decode(data);
              } else {
                if (version === 5) {
                  parsed = AMM_INFO_LAYOUT_STABLE.decode(data);
                  poolInfo.currentK = getBigNumber(parsed.currentK);
                } else parsed = AMM_INFO_LAYOUT_V4.decode(data);

                const { swapFeeNumerator, swapFeeDenominator } = parsed;
                poolInfo.fees = {
                  swapFeeNumerator: getBigNumber(swapFeeNumerator),
                  swapFeeDenominator: getBigNumber(swapFeeDenominator)
                };
              }

              const { status, needTakePnlCoin, needTakePnlPc } = parsed;
              poolInfo.status = getBigNumber(status);
              poolInfo.coin.balance = poolInfo.coin.balance.minus(getBigNumber(needTakePnlCoin));
              poolInfo.pc.balance = poolInfo.pc.balance.minus(getBigNumber(needTakePnlPc));

              break;
            }
            // getLpSupply
            case 'lpMintAddress': {
              const parsed = MINT_LAYOUT.decode(data);

              poolInfo.lp.totalSupply = new BigNumber(parsed.supply);

              break;
            }
          }
        }
      }
    });
    return liquidityPools;
  }

  public async requestLiquidity(symbol1: string, symbol2: string): Promise<LiquidityPoolInfo[]> {
    const LP = LIQUIDITY_POOLS.filter(el => el.name === `${symbol1}-${symbol2}`);
    const { liquidityPools, publicKeys } = LP.reduce(
      (prev, curr) => {
        const { poolCoinTokenAccount, poolPcTokenAccount, ammOpenOrders, ammId, lp } = curr;
        const newPool: LiquidityPoolInfo = JSON.parse(JSON.stringify(curr));
        newPool.coin.balance = new BigNumber(0);
        newPool.pc.balance = new BigNumber(0);

        const newPublicKeys = [
          new PublicKey(poolCoinTokenAccount),
          new PublicKey(poolPcTokenAccount),
          new PublicKey(ammOpenOrders),
          new PublicKey(ammId),
          new PublicKey(lp.mintAddress)
        ];

        return {
          liquidityPools: { ...prev.liquidityPools, [lp.mintAddress]: newPool },
          publicKeys: [...prev.publicKeys, ...newPublicKeys]
        };
      },
      {
        liquidityPools: {},
        publicKeys: []
      }
    );

    const multipleInfo: PublicKeyAccount[] = (
      await this.privateBlockchainAdapter.getMultipleAccounts(publicKeys, 'confirmed')
    ).filter(Boolean);

    return this.getMultipleInfos(multipleInfo, liquidityPools);
  }

  private getMultipleInfos(
    infos: PublicKeyAccount[],
    liquidityPools: LiquidityPools
  ): LiquidityPoolInfo[] {
    return infos.reduce((prev, curr) => {
      const address = curr.publicKey.toBase58();
      const data = Buffer.from(curr.account.data);

      const { key, lpMintAddress, version } = RaydiumLiquidityManager.getAddressForWhat(address);

      if (key && lpMintAddress) {
        const newPoolInfo = liquidityPools[lpMintAddress];
        this.constructPool(newPoolInfo, key as PoolFnName, data, version);
        return [...prev, newPoolInfo];
      }
      return prev;
    }, []);
  }

  private constructPool(
    poolInfo: LiquidityPoolInfo,
    key: PoolFnName,
    data: unknown,
    version: number
  ): void {
    const editPool: PoolGetter = {
      poolCoinTokenAccount: () => {
        const parsed = ACCOUNT_LAYOUT.decode(data);
        poolInfo.coin.balance = poolInfo.coin.balance.plus(getBigNumber(parsed.amount));
      },
      poolPcTokenAccount: () => {
        const parsed = ACCOUNT_LAYOUT.decode(data);
        poolInfo.pc.balance = poolInfo.pc.balance.plus(getBigNumber(parsed.amount));
      },
      ammOpenOrders: () => {
        const OPEN_ORDERS_LAYOUT = OpenOrders.getLayout(new PublicKey(poolInfo.serumProgramId));
        const parsed = OPEN_ORDERS_LAYOUT.decode(data);
        const { baseTokenTotal, quoteTokenTotal } = parsed;

        poolInfo.coin.balance = poolInfo.coin.balance.plus(getBigNumber(baseTokenTotal));
        poolInfo.pc.balance = poolInfo.pc.balance.plus(getBigNumber(quoteTokenTotal));
      },
      ammId: () => {
        const getLayout: { [p: string]: () => LayoutDecode } = {
          2: () => AMM_INFO_LAYOUT.decode(data),
          3: () => AMM_INFO_LAYOUT_V3.decode(data),
          4: () => AMM_INFO_LAYOUT_V4.decode(data)
        };

        const { swapFeeNumerator, swapFeeDenominator, status, needTakePnlCoin, needTakePnlPc } =
          getLayout[version]();

        if (version === 4) {
          poolInfo.fees = {
            swapFeeNumerator: getBigNumber(swapFeeNumerator),
            swapFeeDenominator: getBigNumber(swapFeeDenominator)
          };
        }

        poolInfo.status = getBigNumber(status);
        poolInfo.coin.balance = poolInfo.coin.balance.minus(getBigNumber(needTakePnlCoin));
        poolInfo.pc.balance = poolInfo.pc.balance.minus(getBigNumber(needTakePnlPc));
      },
      lpMintAddress: () => {
        const parsed = MINT_LAYOUT.decode(data);
        poolInfo.lp.totalSupply = new BigNumber(getBigNumber(parsed.supply));
      }
    };
    editPool[key]();
  }

  public async getLpMintListDecimals(
    mintAddressInfos: string[]
  ): Promise<{ [name: string]: number }> {
    const reLpInfoDict: { [name: string]: number } = {};
    const mintList = [] as PublicKey[];
    mintAddressInfos.forEach(item => {
      let lpInfo = Object.values(LP_TOKENS).find(itemLpToken => itemLpToken.mintAddress === item);
      if (!lpInfo) {
        mintList.push(new PublicKey(item));
        lpInfo = {
          decimals: null
        } as RubicAny;
      }
      reLpInfoDict[item] = lpInfo.decimals;
    });

    const mintAll = await this.privateBlockchainAdapter.getMultipleAccounts(mintList);
    for (let mintIndex = 0; mintIndex < mintAll.length; mintIndex += 1) {
      const itemMint = mintAll[mintIndex];
      if (itemMint) {
        const mintLayoutData = MINT_LAYOUT.decode(Buffer.from(itemMint.account.data));
        reLpInfoDict[mintList[mintIndex].toString()] = mintLayoutData.decimals;
      }
    }
    const reInfo: { [name: string]: number } = {};
    for (const key of Object.keys(reLpInfoDict)) {
      if (reLpInfoDict[key] !== null) {
        reInfo[key] = reLpInfoDict[key];
      }
    }
    return reInfo;
  }
}
