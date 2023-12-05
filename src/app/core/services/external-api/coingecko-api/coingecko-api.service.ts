import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, timeout } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Cacheable } from 'ts-cacheable';
import { BLOCKCHAIN_NAME, BlockchainName, BlockchainsInfo, Web3Pure } from 'rubic-sdk';

const supportedBlockchains = [
  BLOCKCHAIN_NAME.ETHEREUM,
  BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
  BLOCKCHAIN_NAME.POLYGON,
  BLOCKCHAIN_NAME.HARMONY,
  BLOCKCHAIN_NAME.AVALANCHE,
  BLOCKCHAIN_NAME.MOONRIVER,
  BLOCKCHAIN_NAME.FANTOM,
  BLOCKCHAIN_NAME.ARBITRUM,
  BLOCKCHAIN_NAME.AURORA,
  BLOCKCHAIN_NAME.TELOS,
  BLOCKCHAIN_NAME.ETHEREUM_POW,
  BLOCKCHAIN_NAME.BITGERT,
  BLOCKCHAIN_NAME.OASIS,
  BLOCKCHAIN_NAME.METIS,
  BLOCKCHAIN_NAME.DFK,
  BLOCKCHAIN_NAME.KLAYTN,
  BLOCKCHAIN_NAME.VELAS,
  BLOCKCHAIN_NAME.SYSCOIN,
  BLOCKCHAIN_NAME.ZK_SYNC,
  BLOCKCHAIN_NAME.OPTIMISM,
  BLOCKCHAIN_NAME.PULSECHAIN,
  BLOCKCHAIN_NAME.LINEA,
  BLOCKCHAIN_NAME.MANTLE,
  BLOCKCHAIN_NAME.BASE
] as const;

type SupportedBlockchain = (typeof supportedBlockchains)[number];

const API_BASE_URL = 'https://api.coingecko.com/api/v3/';

@Injectable({
  providedIn: 'root'
})
export class CoingeckoApiService {
  private readonly nativeCoinsCoingeckoIds: Record<SupportedBlockchain, string>;

  private readonly tokenBlockchainId: Record<SupportedBlockchain, string>;

  constructor(private readonly httpClient: HttpClient) {
    this.nativeCoinsCoingeckoIds = {
      [BLOCKCHAIN_NAME.ETHEREUM]: 'ethereum',
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'binancecoin',
      [BLOCKCHAIN_NAME.POLYGON]: 'matic-network',
      [BLOCKCHAIN_NAME.HARMONY]: 'harmony',
      [BLOCKCHAIN_NAME.AVALANCHE]: 'avalanche-2',
      [BLOCKCHAIN_NAME.MOONRIVER]: 'moonriver',
      [BLOCKCHAIN_NAME.FANTOM]: 'fantom',
      [BLOCKCHAIN_NAME.ARBITRUM]: 'ethereum',
      [BLOCKCHAIN_NAME.AURORA]: 'ethereum',
      [BLOCKCHAIN_NAME.TELOS]: 'telos',
      [BLOCKCHAIN_NAME.ETHEREUM_POW]: 'ethereum-pow-iou',
      [BLOCKCHAIN_NAME.BITGERT]: 'bitgert',
      [BLOCKCHAIN_NAME.OASIS]: 'oasis',
      [BLOCKCHAIN_NAME.METIS]: 'metis-token',
      [BLOCKCHAIN_NAME.DFK]: 'defi-kingdoms',
      [BLOCKCHAIN_NAME.KLAYTN]: 'klaytn',
      [BLOCKCHAIN_NAME.VELAS]: 'velas',
      [BLOCKCHAIN_NAME.SYSCOIN]: 'syscoin',
      [BLOCKCHAIN_NAME.ZK_SYNC]: 'ethereum',
      [BLOCKCHAIN_NAME.OPTIMISM]: 'ethereum',
      [BLOCKCHAIN_NAME.PULSECHAIN]: 'pulsechain',
      [BLOCKCHAIN_NAME.LINEA]: 'linea',
      [BLOCKCHAIN_NAME.MANTLE]: 'mantle',
      [BLOCKCHAIN_NAME.BASE]: 'ethereum'
    };

    this.tokenBlockchainId = {
      [BLOCKCHAIN_NAME.ETHEREUM]: 'ethereum',
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'binance-smart-chain',
      [BLOCKCHAIN_NAME.POLYGON]: 'polygon-pos',
      [BLOCKCHAIN_NAME.HARMONY]: 'harmony-shard-0',
      [BLOCKCHAIN_NAME.AVALANCHE]: 'avalanche',
      [BLOCKCHAIN_NAME.MOONRIVER]: 'moonriver',
      [BLOCKCHAIN_NAME.FANTOM]: 'fantom',
      [BLOCKCHAIN_NAME.ARBITRUM]: 'arbitrum-one',
      [BLOCKCHAIN_NAME.AURORA]: 'aurora',
      [BLOCKCHAIN_NAME.TELOS]: 'telos',
      [BLOCKCHAIN_NAME.ETHEREUM_POW]: 'ethereum-pow-iou',
      [BLOCKCHAIN_NAME.BITGERT]: 'bitgert',
      [BLOCKCHAIN_NAME.OASIS]: 'oasis',
      [BLOCKCHAIN_NAME.METIS]: 'metis-andromeda',
      [BLOCKCHAIN_NAME.DFK]: 'defi-kingdoms',
      [BLOCKCHAIN_NAME.KLAYTN]: 'klaytn',
      [BLOCKCHAIN_NAME.VELAS]: 'velas',
      [BLOCKCHAIN_NAME.SYSCOIN]: 'syscoin',
      [BLOCKCHAIN_NAME.ZK_SYNC]: 'zksync',
      [BLOCKCHAIN_NAME.OPTIMISM]: 'ethereum',
      [BLOCKCHAIN_NAME.PULSECHAIN]: 'pulsechain',
      [BLOCKCHAIN_NAME.LINEA]: 'linea',
      [BLOCKCHAIN_NAME.MANTLE]: 'mantle',
      [BLOCKCHAIN_NAME.BASE]: 'base'
    };
  }

  private isSupportedBlockchain(blockchain: BlockchainName): blockchain is SupportedBlockchain {
    return supportedBlockchains.some(supportedBlockchain => supportedBlockchain === blockchain);
  }

  /**
   * Gets price of native coin in usd from coingecko.
   * @param blockchain Supported by {@link supportedBlockchains} blockchain.
   */
  @Cacheable({
    maxAge: 13_000,
    maxCacheCount: supportedBlockchains.length
  })
  public getNativeCoinPrice(blockchain: BlockchainName): Observable<number | undefined> {
    if (!this.isSupportedBlockchain(blockchain)) {
      return of(undefined);
    }

    const coingeckoId = this.nativeCoinsCoingeckoIds[blockchain];
    return this.httpClient
      .get(`${API_BASE_URL}simple/price`, {
        params: { ids: coingeckoId, vs_currencies: 'usd' }
      })
      .pipe(
        timeout(3_000),
        map((response: { [key: string]: { usd: string } }) => {
          return +response[coingeckoId].usd;
        }),
        catchError((_err: unknown) => {
          console.debug('Coingecko is not alive');
          return of(undefined);
        })
      );
  }

  /**
   * Gets price of token in usd from coingecko.
   * @param blockchain Supported by {@link supportedBlockchains} blockchain.
   * @param tokenAddress Address of token to get price for.
   */
  @Cacheable({
    maxAge: 13_000,
    maxCacheCount: 4
  })
  public getCommonTokenPrice(
    blockchain: BlockchainName,
    tokenAddress: string
  ): Observable<number | undefined> {
    if (!this.isSupportedBlockchain(blockchain)) {
      return of(undefined);
    }

    const blockchainId = this.tokenBlockchainId[blockchain];
    return this.httpClient
      .get(`${API_BASE_URL}coins/${blockchainId}/contract/${tokenAddress.toLowerCase()}`)
      .pipe(
        timeout(3_000),
        map((response: { market_data: { current_price: { usd: number } } }) => {
          return response?.market_data?.current_price?.usd;
        }),
        catchError((err: unknown) => {
          console.debug('Coingecko cannot retrieve token price', err);
          return of(undefined);
        })
      );
  }

  /**
   * Gets price of common token or native coin in usd from coingecko.
   * @param token Token to get price for.
   */
  public getCommonTokenOrNativeCoinPrice(token: {
    address: string;
    blockchain: BlockchainName;
  }): Observable<number | undefined> {
    if (!this.isSupportedBlockchain(token.blockchain)) {
      return of(undefined);
    }

    if (Web3Pure[BlockchainsInfo.getChainType(token.blockchain)].isNativeAddress(token.address)) {
      return this.getNativeCoinPrice(token.blockchain);
    }
    return this.getCommonTokenPrice(token.blockchain, token.address);
  }
}
