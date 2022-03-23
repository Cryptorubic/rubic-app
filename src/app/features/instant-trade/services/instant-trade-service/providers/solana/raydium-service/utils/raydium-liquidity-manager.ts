import { AccountInfo, PublicKey } from '@solana/web3.js';
import { HttpClient } from '@angular/common/http';
import { SolanaWeb3Public } from '@core/services/blockchain/blockchain-adapters/solana/solana-web3-public';
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
import { SolanaWeb3PrivateService } from '@core/services/blockchain/blockchain-adapters/solana/solana-web3-private.service';
import { MARKET_STATE_LAYOUT_V2, OpenOrders } from '@project-serum/serum';
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
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { ENDPOINTS, TokensBackendResponse } from '@core/services/backend/tokens-api/models/tokens';
import { map } from 'rxjs/operators';
import { RaydiumStableSwapManager } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/utils/raydium-stable-swap-manager';
import { RaydiumRoutingService } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/utils/raydium-routering.service';

type LpAddress = { key: string; lpMintAddress: string; version: number };

type LpInfo = { [p: string]: LiquidityPoolInfo };

type LpDecimals = { [name: string]: number };

type PubKeyAccountInfo = { publicKey: PublicKey; accountInfo: AccountInfo<Buffer> };

export class RaydiumLiquidityManager {
  private allPools: LiquidityPoolInfo[];

  constructor(
    public readonly httpClient: HttpClient,
    private readonly publicBlockchainAdapter: SolanaWeb3Public,
    private readonly privateBlockchainAdapter: SolanaWeb3PrivateService
  ) {}

  public getAddressForWhat(address: string, pools: LiquidityPoolInfo[]): Partial<LpAddress> {
    for (const pool of pools) {
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
    solanaTokens: List<TokenAmount>,
    multihops: boolean
  ): Promise<LpInfo> {
    if (!this.allPools?.length) {
      const { ammAll, lpMintAddressList, marketAll } = await this.fetchAmmAndMintAddresses();
      const lpMintListDecimals = await this.getLpMintListDecimals(lpMintAddressList);
      try {
        this.allPools = await this.getAllPools(ammAll, marketAll, solanaTokens, lpMintListDecimals);
      } catch (err) {
        console.debug(err);
      }
    }

    return await this.getSpecificPools(this.allPools, multihops, fromSymbol, toSymbol);
  }

  public async getLpMintListDecimals(mintAddressInfos: string[]): Promise<LpDecimals> {
    const reLpInfoDict: LpDecimals = {};
    const mintList: PublicKey[] = [];
    mintAddressInfos.forEach(item => {
      const lpInfo = Object.values(LP_TOKENS).find(itemLpToken => itemLpToken.mintAddress === item);
      if (!lpInfo) {
        mintList.push(new PublicKey(item));
      }
      reLpInfoDict[item] = lpInfo ? lpInfo.decimals : null;
    });

    const mintAll = await this.privateBlockchainAdapter.getMultipleAccounts(mintList);

    for (let mintIndex = 0; mintIndex < mintAll.length; mintIndex += 1) {
      const itemMint = mintAll[mintIndex];
      if (itemMint) {
        const mintLayoutData = MINT_LAYOUT.decode(Buffer.from(itemMint.account.data));
        reLpInfoDict[mintList[mintIndex].toString()] = mintLayoutData.decimals;
      }
    }
    return Object.keys(reLpInfoDict).reduce((prev, key) => {
      if (reLpInfoDict[key] !== null) {
        return { ...prev, [key]: reLpInfoDict[key] };
      }
      return prev;
    }, {} as LpDecimals);
  }

  private async getAllPools(
    ammAll: PubKeyAccountInfo[],
    marketAll: {
      [key: string]: {
        bids: object;
        asks: object;
        eventQueue: object;
        baseVault: object;
        quoteVault: object;
        serumVaultSigner: object;
      };
    },
    solanaTokens: List<TokenAmount>,
    lpMintListDecimals: { [p: string]: number }
  ): Promise<LiquidityPoolInfo[]> {
    const liquidityPools = [...LIQUIDITY_POOLS];
    const tokens: List<SolanaTokenInfo> = solanaTokens.map(el => ({
      symbol: el.symbol,
      name: el.name,
      mintAddress: el.address,
      decimals: el.decimals
    }));
    const { publicKey } = await this.privateBlockchainAdapter.createAmmAuthority(
      new PublicKey(LIQUIDITY_POOL_PROGRAM_ID_V4)
    );
    const solanaBackendTokens = await this.fetchSolanaBackendTokens();

    return ammAll.reduce(async (promiseAcc, curr, index) => {
      const acc = await promiseAcc;
      const ammInfo = AMM_INFO_LAYOUT_V4.decode(Buffer.from(curr.accountInfo.data));
      const fromCoin = ammInfo.coinMintAddress.toString();
      const toCoin = ammInfo.pcMintAddress.toString();

      let coin =
        tokens.find(item => item.mintAddress === fromCoin) ||
        Object.values(TOKENS).find(item => item.mintAddress === fromCoin) ||
        solanaBackendTokens?.[fromCoin];
      let pc =
        tokens.find(item => item.mintAddress === toCoin) ||
        Object.values(TOKENS).find(item => item.mintAddress === toCoin) ||
        solanaBackendTokens?.[toCoin];

      if (!coin || !pc) {
        return acc;
      }

      const lp = Object.values(LP_TOKENS).find(
        item => item.mintAddress === ammInfo.lpMintAddress
      ) || {
        symbol: `${coin.symbol}-${pc.symbol}`,
        name: `${coin.symbol}-${pc.symbol}`,
        coin,
        pc,
        mintAddress: ammInfo.lpMintAddress.toString(),
        decimals: lpMintListDecimals[ammInfo.lpMintAddress]
      };
      const market = marketAll?.[ammInfo.serumMarket];

      const itemLiquidity: LiquidityPoolInfo = {
        name: `${coin.symbol}-${pc.symbol}`,
        coin,
        pc,
        lp,
        version: 4,
        programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
        // Amm.
        ammId: ammAll[index].publicKey.toString(),
        ammAuthority: publicKey.toString(),
        ammOpenOrders: ammInfo.ammOpenOrders.toString(),
        ammTargetOrders: ammInfo.ammTargetOrders.toString(),
        ammQuantities: NATIVE_SOL.mintAddress,
        poolCoinTokenAccount: ammInfo.poolCoinTokenAccount.toString(),
        poolPcTokenAccount: ammInfo.poolPcTokenAccount.toString(),
        poolWithdrawQueue: ammInfo.poolWithdrawQueue.toString(),
        poolTempLpTokenAccount: ammInfo.poolTempLpTokenAccount.toString(),
        // Orders.
        serumProgramId: SERUM_PROGRAM_ID_V3,
        serumMarket: ammInfo.serumMarket.toString(),
        serumBids: market?.bids?.toString(),
        serumAsks: market?.asks?.toString(),
        serumEventQueue: market?.eventQueue?.toString(),
        serumCoinVaultAccount: market?.baseVault?.toString(),
        serumPcVaultAccount: market?.quoteVault?.toString(),
        serumVaultSigner: market?.serumVaultSigner?.toString(),
        official: false
      };

      const hasPool = liquidityPools.some(item => item.ammId === itemLiquidity.ammId);

      if (!hasPool) {
        return [...acc, itemLiquidity];
      }
      return [
        ...acc.map(
          el =>
            (el.ammId === itemLiquidity.ammId && el.name !== itemLiquidity.name && !el.official
              ? itemLiquidity
              : el) as LiquidityPoolInfo
        )
      ];
    }, Promise.resolve([...liquidityPools]));
  }

  private fetchSolanaBackendTokens(): Promise<{ [key: string]: SolanaTokenInfo }> {
    return this.httpClient
      .get<TokensBackendResponse>(`api/${ENDPOINTS.TOKKENS}?page=1&page_size=9999&network=solana`)
      .pipe(
        map(tokensResponse => {
          return Object.fromEntries(
            tokensResponse.results.map(el => [
              el.address,
              {
                symbol: el.symbol,
                name: el.name,
                mintAddress: el.address,
                decimals: el.decimals
              }
            ])
          );
        })
      )
      .toPromise();
  }

  private async getSpecificPools(
    allPools: LiquidityPoolInfo[],
    multihops: boolean,
    fromSymbol: string,
    toSymbol: string
  ): Promise<LpInfo> {
    const publicKeys: PublicKey[] = [];
    const liquidityPools: LpInfo = {};
    let LP: LiquidityPoolInfo[] = [];
    if (multihops) {
      const transitTokens = RaydiumRoutingService.transitTokens;
      const transitTokensWithoutFrom = transitTokens.filter(el => el !== fromSymbol);
      const transitTokensWithoutTo = transitTokens.filter(el => el !== toSymbol);

      LP = [...allPools].filter(pool => {
        const [fromPoolToken, toPoolToken] = pool.name.split('-').map(el => el);

        return (
          (fromPoolToken === fromSymbol && transitTokensWithoutFrom.includes(toPoolToken)) ||
          (toPoolToken === fromSymbol && transitTokensWithoutFrom.includes(fromPoolToken)) ||
          (toPoolToken === toSymbol && transitTokensWithoutTo.includes(fromPoolToken)) ||
          (fromPoolToken === toSymbol && transitTokensWithoutTo.includes(toPoolToken))
        );
      });
    } else {
      LP = [...allPools].filter(
        pool =>
          pool.name === `${fromSymbol}-${toSymbol}` || pool.name === `${toSymbol}-${fromSymbol}`
      );
    }

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
    const modelAccount: { [account: string]: string[] } = {};

    multipleInfo.forEach(info => {
      if (info) {
        const address = info.publicKey.toBase58();
        const data = Buffer.from(info.account.data);

        const { key, lpMintAddress, version } = this.getAddressForWhat(address, LP);

        if (key && lpMintAddress) {
          const poolInfo = liquidityPools[lpMintAddress];
          switch (key) {
            case 'poolCoinTokenAccount': {
              const parsed = ACCOUNT_LAYOUT.decode(data);
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

                  if (modelAccount[parsed.modelDataAccount.toString()] === undefined)
                    modelAccount[parsed.modelDataAccount.toString()] = [];
                  modelAccount[parsed.modelDataAccount.toString()].push(lpMintAddress);
                } else {
                  parsed = AMM_INFO_LAYOUT_V4.decode(data);
                }

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
            case 'lpMintAddress': {
              const parsed = MINT_LAYOUT.decode(data);

              poolInfo.lp.totalSupply = new BigNumber(parsed.supply);

              break;
            }
          }
        }
      }
    });

    if (Object.keys(modelAccount).length > 0) {
      const modelAccountData = await this.privateBlockchainAdapter.getMultipleAccounts(
        Object.keys(modelAccount).map(item => new PublicKey(item))
      );
      for (const item of modelAccountData) {
        if (item === null) continue;
        const lpMintList = modelAccount[item.publicKey.toString()];
        const data = RaydiumStableSwapManager.formatLayout(item.account.data);
        for (const itemLp of lpMintList) {
          liquidityPools[itemLp].modelData = data;
        }
      }
    }

    return liquidityPools;
  }

  private async fetchAmmAndMintAddresses(): Promise<{
    ammAll: PubKeyAccountInfo[];
    marketAll: {
      [name: string]: {
        bids: object;
        asks: object;
        eventQueue: object;
        baseVault: object;
        quoteVault: object;
        serumVaultSigner: object;
      };
    };
    lpMintAddressList: string[];
  }> {
    const ammAll = await this.privateBlockchainAdapter.getFilteredProgramAccountsAmmOrMarketCache(
      'amm',
      new PublicKey(LIQUIDITY_POOL_PROGRAM_ID_V4),
      [{ dataSize: AMM_INFO_LAYOUT_V4.span }]
    );

    const marketAccounts =
      await this.privateBlockchainAdapter.getFilteredProgramAccountsAmmOrMarketCache(
        'market',
        new PublicKey(SERUM_PROGRAM_ID_V3),
        [{ dataSize: MARKET_STATE_LAYOUT_V2.span }]
      );

    const marketAll: {
      [name: string]: {
        bids: object;
        asks: object;
        eventQueue: object;
        baseVault: object;
        quoteVault: object;
        serumVaultSigner: object;
      };
    } = Object.fromEntries(
      marketAccounts.map(item => [
        item.publicKey.toString(),
        MARKET_STATE_LAYOUT_V2.decode(item.accountInfo.data)
      ])
    );

    const lpMintAddressList = ammAll.reduce((acc, curr) => {
      const ammLayout = AMM_INFO_LAYOUT_V4.decode(Buffer.from(curr.accountInfo.data));
      if (
        ammLayout.pcMintAddress.toString() === ammLayout.serumMarket.toString() ||
        ammLayout.lpMintAddress.toString() === '11111111111111111111111111111111' ||
        !Object.keys(marketAll).includes(ammLayout.serumMarket.toString())
      ) {
        return acc;
      }
      return [...acc, ammLayout.lpMintAddress.toString()];
    }, []);
    return { ammAll, lpMintAddressList, marketAll };
  }
}
