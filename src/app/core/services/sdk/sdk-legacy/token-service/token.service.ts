import { Injectable } from '@angular/core';
import {
  BlockchainName,
  BlockchainsInfo,
  Cache as Memo,
  CHAIN_TYPE,
  EvmBlockchainName,
  nativeTokensList,
  PriceToken,
  PriceTokenAmount,
  SolanaBlockchainName,
  SuiBlockchainName,
  TO_BACKEND_BLOCKCHAINS,
  Token,
  TokenAmount,
  TokenBaseStruct,
  TonBlockchainName,
  TronBlockchainName,
  StellarBlockchainName
} from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { BlockchainAdapterFactoryService } from '../blockchain-adapter-factory/blockchain-adapter-factory.service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Web3Pure } from '@cryptorubic/web3';

interface TokenPriceFromBackend {
  network: string;
  address: string;
  usd_price: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly adaptersFactoryService: BlockchainAdapterFactoryService
  ) {}

  @Memo({ maxAge: 60_000 })
  public async createTokens<T extends BlockchainName = BlockchainName>(
    addresses: string[],
    blockchain: T
  ): Promise<Token<BlockchainName>[]> {
    const tokenBlockchain = blockchain;
    const adapter = this.adaptersFactoryService.getAdapter(tokenBlockchain as EvmBlockchainName);
    return adapter.callForTokensInfo(addresses);
  }

  @Memo({ maxAge: 60_000 })
  public async createToken(tokenBaseStruct: TokenBaseStruct): Promise<Token> {
    const chainType = BlockchainsInfo.getChainType(tokenBaseStruct.blockchain);

    if (chainType === CHAIN_TYPE.EVM) {
      const blockchain = tokenBaseStruct.blockchain as EvmBlockchainName;
      const adapter = this.adaptersFactoryService.getAdapter(blockchain);
      const tokensInfo = await adapter.callForTokensInfo([tokenBaseStruct.address]);
      return tokensInfo![0] as Token;
    }
    if (chainType === CHAIN_TYPE.SOLANA) {
      const blockchain = tokenBaseStruct.blockchain as SolanaBlockchainName;
      const adapter = this.adaptersFactoryService.getAdapter(blockchain);
      const tokensInfo = await adapter.callForTokensInfo([tokenBaseStruct.address]);
      return tokensInfo![0] as Token;
    }
    if (chainType === CHAIN_TYPE.TRON) {
      const blockchain = tokenBaseStruct.blockchain as TronBlockchainName;
      const adapter = this.adaptersFactoryService.getAdapter(blockchain);
      const tokensInfo = await adapter.callForTokensInfo([tokenBaseStruct.address]);
      return tokensInfo![0] as Token;
    }
    if (chainType === CHAIN_TYPE.TON) {
      const blockchain = tokenBaseStruct.blockchain as TonBlockchainName;
      const adapter = this.adaptersFactoryService.getAdapter(blockchain);
      const tokensInfo = await adapter.callForTokensInfo([tokenBaseStruct.address]);
      return tokensInfo![0] as Token;
    }
    if (chainType === CHAIN_TYPE.SUI) {
      const blockchain = tokenBaseStruct.blockchain as SuiBlockchainName;
      const adapter = this.adaptersFactoryService.getAdapter(blockchain);
      const tokensInfo = await adapter.callForTokensInfo([tokenBaseStruct.address]);
      return tokensInfo![0] as Token;
    }
    if (chainType === CHAIN_TYPE.STELLAR) {
      const blockchain = tokenBaseStruct.blockchain as StellarBlockchainName;
      const adapter = this.adaptersFactoryService.getAdapter(blockchain);
      const tokensInfo = await adapter.callForTokenInfo(tokenBaseStruct.address);
      return tokensInfo;
    }

    if (Web3Pure.isNativeAddress(tokenBaseStruct.blockchain, tokenBaseStruct.address)) {
      const nativeNonEvmToken = nativeTokensList[tokenBaseStruct.blockchain];
      if (nativeNonEvmToken) return nativeNonEvmToken as Token;
    }

    const errorMessage = `No adapter for blockchain ${tokenBaseStruct.blockchain}`;
    throw new Error(errorMessage);
  }

  @Memo({ maxAge: 60_000 })
  public async createTokenAmount(
    tokenBaseStruct: TokenBaseStruct,
    tokenAmount: BigNumber
  ): Promise<TokenAmount> {
    const token = await this.createToken(tokenBaseStruct);
    return new TokenAmount({ ...token, tokenAmount });
  }

  public async createTokenWeiAmount(
    tokenBaseStruct: TokenBaseStruct,
    weiAmount: string
  ): Promise<TokenAmount> {
    const token = await this.createToken(tokenBaseStruct);
    return new TokenAmount({ ...token, weiAmount });
  }

  @Memo({ maxAge: 60_000 })
  public async createPriceToken<T extends BlockchainName = BlockchainName>(
    tokenBaseStruct: TokenBaseStruct<T>
  ): Promise<PriceToken<BlockchainName>> {
    const results = await Promise.all([
      this.createToken(tokenBaseStruct),
      this.getTokenPrice({
        address: tokenBaseStruct.address,
        blockchain: tokenBaseStruct.blockchain as BlockchainName
      })
    ]);

    return new PriceToken({ ...results[0], price: results[1] });
  }

  @Memo({ maxAge: 60_000 })
  public async createPriceTokenAmount<T extends BlockchainName = BlockchainName>(
    tokenBaseStruct: TokenBaseStruct<T>,
    amount: BigNumber | string
  ): Promise<PriceTokenAmount<BlockchainName>> {
    try {
      const results = await Promise.allSettled([
        this.createToken(tokenBaseStruct),
        this.getTokenPrice({
          address: tokenBaseStruct.address,
          blockchain: tokenBaseStruct.blockchain as BlockchainName
        })
      ]);

      const tokenAmount = new BigNumber(amount);
      const token = results[0].status === 'fulfilled' ? results[0].value : null;
      const price = results[1].status === 'fulfilled' ? results[1].value : null;

      if (tokenAmount.isNaN() || !token || !price) {
        throw Error();
      }

      return new PriceTokenAmount({ ...token, price: price, tokenAmount });
    } catch {
      throw new Error('Failed to create token amount');
    }
  }

  @Memo({ maxAge: 60_000 })
  private async getTokenPriceFromBackend(
    blockchain: BlockchainName,
    tokenAddress: string
  ): Promise<TokenPriceFromBackend> {
    try {
      const backendBlockchain = TO_BACKEND_BLOCKCHAINS[blockchain];
      const result = await firstValueFrom(
        this.httpClient.get<TokenPriceFromBackend>(
          `https://api.rubic.exchange/api/v2/tokens/price/${backendBlockchain}/${tokenAddress}`
        )
      );
      return result;
    } catch (error) {
      return {
        address: tokenAddress,
        network: blockchain,
        usd_price: null
      };
    }
  }

  /**
   * Gets price of common token or native coin in usd from rubic backend.
   * @param token Token to get price for.
   */
  @Memo({ maxAge: 60_000 })
  public async getTokenPrice(token: {
    address: string;
    blockchain: BlockchainName;
  }): Promise<BigNumber> {
    const response = await this.getTokenPriceFromBackend(token.blockchain, token.address);

    return new BigNumber(response?.usd_price || NaN);
  }
}
