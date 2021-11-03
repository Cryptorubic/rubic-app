import { Injectable } from '@angular/core';
import { List } from 'immutable';
import { from, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { first, tap } from 'rxjs/operators';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3/web3-public-service/web3-public.service';
import { Web3PrivateService } from 'src/app/core/services/blockchain/web3/web3-private-service/web3-private.service';
import { BridgeApiService } from 'src/app/core/services/backend/bridge-api/bridge-api.service';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { TransactionReceipt } from 'web3-eth';
import { BridgeTokenPair } from 'src/app/features/bridge/models/BridgeTokenPair';
import { NATIVE_TOKEN_ADDRESS } from 'src/app/shared/constants/blockchain/NATIVE_TOKEN_ADDRESS';
import { BridgeTrade } from 'src/app/features/bridge/models/BridgeTrade';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { TRANSACTION_STATUS } from 'src/app/shared/models/blockchain/TRANSACTION_STATUS';
import { BRIDGE_PROVIDER } from 'src/app/shared/models/bridge/BRIDGE_PROVIDER';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { Web3Public } from 'src/app/core/services/blockchain/web3/web3-public-service/Web3Public';
import posRootChainManagerAbi from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/ethereum-polygon-bridge-provider/constants/posRootChainManagerContract/posRootChainManagerAbi';
import posRootChainManagerAddress from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/ethereum-polygon-bridge-provider/constants/posRootChainManagerContract/posRootChainManagerAddress';
import { compareAddresses } from 'src/app/shared/utils/utils';
import { PCacheable } from 'ts-cacheable';
import UChild_ERC20_ABI from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/ethereum-polygon-bridge-provider/constants/UChild_ERC20/UChild_ERC20_ABI';
import { Web3Pure } from 'src/app/core/services/blockchain/web3/web3-pure/web3-pure';
import { BlockchainsBridgeProvider } from '../blockchains-bridge-provider';

interface PolygonGraphToken {
  rootToken: string;
  childToken: string;
  isPOS: true;
}

interface PolygonGraphResponse {
  data: {
    tokenMappings: [PolygonGraphToken];
  };
}

const POLYGON_GRAPH_API_URL =
  'https://api.thegraph.com/subgraphs/name/maticnetwork/mainnet-root-subgraphs';

const ERC20_TOKEN_TYPE = '0x8ae85d849167ff996c04040c44924fd364217285e4cad818292c7ac37c0a345b';

@Injectable()
export class EthereumPolygonBridgeProviderService extends BlockchainsBridgeProvider {
  private readonly web3PublicEth: Web3Public;

  private readonly web3PublicPolygon: Web3Public;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly web3PublicService: Web3PublicService,
    private readonly web3PrivateService: Web3PrivateService,
    private readonly bridgeApiService: BridgeApiService,
    private readonly tokensService: TokensService,
    private readonly authService: AuthService
  ) {
    super();
    this.web3PublicEth = this.web3PublicService[BLOCKCHAIN_NAME.ETHEREUM];
    this.web3PublicPolygon = this.web3PublicService[BLOCKCHAIN_NAME.POLYGON];

    this.tokensService.tokens$.pipe(first(tokens => !!tokens.size)).subscribe(tokenAmounts => {
      this.getTokensList(tokenAmounts);
    });
  }

  private getTokensList(tokenAmounts: List<TokenAmount>): void {
    const query = `{
      tokenMappings(
        first: 1000,
        where: {
          isPOS: true,
          tokenType: "${ERC20_TOKEN_TYPE}"
        }
      ) {
        rootToken
        childToken
        isPOS
      }
    }`;

    this.httpClient
      .post(POLYGON_GRAPH_API_URL, {
        query
      })
      .subscribe(
        async (response: PolygonGraphResponse) => {
          if (!response.data) {
            this.tokenPairs$.next(List([]));
            return;
          }

          const posTokens = response.data.tokenMappings;
          const promisesTokens: Promise<BridgeTokenPair>[] = [];

          posTokens.forEach(token =>
            promisesTokens.push(this.parsePolygonTokens(token, tokenAmounts))
          );
          const bridgeTokenPairs = await Promise.all(promisesTokens);

          this.tokenPairs$.next(
            List(bridgeTokenPairs.filter(bridgeTokenPair => bridgeTokenPair !== null))
          );
        },
        err => {
          console.debug('Error retrieving polygon tokens: ', err);
          this.tokenPairs$.next(List([]));
        }
      );
  }

  private async parsePolygonTokens(
    token: PolygonGraphToken,
    tokenAmounts: List<TokenAmount>
  ): Promise<BridgeTokenPair> {
    const ethAddress = token.rootToken;
    let polygonAddress = token.childToken;

    // Mapping for ETH native token is corrected
    if (ethAddress === NATIVE_TOKEN_ADDRESS) {
      polygonAddress = '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619';
    }

    // Mapping for MATIC native token is incorrect
    if (polygonAddress === NATIVE_TOKEN_ADDRESS) {
      return null;
    }

    try {
      const ethToken = tokenAmounts
        .filter(item => item.blockchain === BLOCKCHAIN_NAME.ETHEREUM)
        .find(tokenAmount => compareAddresses(tokenAmount.address, ethAddress));
      const polygonToken = tokenAmounts
        .filter(item => item.blockchain === BLOCKCHAIN_NAME.POLYGON)
        .find(tokenAmount => compareAddresses(tokenAmount.address, polygonAddress));

      if (!ethToken || !polygonToken) {
        return null;
      }

      return {
        symbol: ethToken.symbol,
        image: '',
        rank: 0,

        tokenByBlockchain: {
          [BLOCKCHAIN_NAME.ETHEREUM]: {
            blockchain: BLOCKCHAIN_NAME.ETHEREUM,
            address: ethToken.address,
            name: ethToken.name,
            symbol: ethToken.symbol,
            decimals: ethToken.decimals,

            minAmount: 0,
            maxAmount: Infinity
          },
          [BLOCKCHAIN_NAME.POLYGON]: {
            blockchain: BLOCKCHAIN_NAME.POLYGON,
            address: polygonToken.address,
            name: polygonToken.name,
            symbol: polygonToken.symbol,
            decimals: polygonToken.decimals,

            minAmount: 0,
            maxAmount: Infinity
          }
        },

        fromEthFee: 0,
        toEthFee: 0
      };
    } catch (err) {
      console.debug('Error getting polygon tokens:', err, token.rootToken, token.childToken);
      return null;
    }
  }

  public getProviderType(): BRIDGE_PROVIDER {
    return BRIDGE_PROVIDER.POLYGON;
  }

  public getFee(): Observable<number> {
    return of(0);
  }

  /**
   * Gets contract address in Ethereum to send tokens to.
   * @param tokenAddress Address of token to send.
   * @return Promise<string> Ethereum contract address.
   */
  @PCacheable({
    maxAge: 15 * 60 * 1000
  })
  private async getPredicateAddress(tokenAddress: string): Promise<string> {
    const tokenType = await this.web3PublicEth.callContractMethod(
      posRootChainManagerAddress,
      posRootChainManagerAbi,
      'tokenToType',
      { methodArguments: [tokenAddress] }
    );
    if (!tokenType) {
      throw new Error('Invalid Token Type');
    }
    return await this.web3PublicEth.callContractMethod(
      posRootChainManagerAddress,
      posRootChainManagerAbi,
      'typeToPredicate',
      { methodArguments: [tokenType] }
    );
  }

  public needApprove(bridgeTrade: BridgeTrade): Observable<boolean> {
    if (bridgeTrade.fromBlockchain === BLOCKCHAIN_NAME.POLYGON) {
      return of(false);
    }

    const token = bridgeTrade.token.tokenByBlockchain[BLOCKCHAIN_NAME.ETHEREUM];
    if (Web3Public.isNativeAddress(token.address)) {
      return of(false);
    }

    return from(
      (async () => {
        const predicateAddress = await this.getPredicateAddress(token.address);
        const walletAddress = this.authService.userAddress;
        const allowance = await this.web3PublicEth.getAllowance(
          token.address,
          walletAddress,
          predicateAddress
        );
        return bridgeTrade.amount.gt(Web3Public.fromWei(allowance, token.decimals));
      })()
    );
  }

  public approve(bridgeTrade: BridgeTrade): Observable<TransactionReceipt> {
    return from(
      (async () => {
        const token = bridgeTrade.token.tokenByBlockchain[bridgeTrade.fromBlockchain];
        const predicateAddress = await this.getPredicateAddress(token.address);
        return this.web3PrivateService.approveTokens(token.address, predicateAddress, 'infinity', {
          onTransactionHash: bridgeTrade.onTransactionHash
        });
      })()
    );
  }

  public createTrade(bridgeTrade: BridgeTrade): Observable<TransactionReceipt> {
    return this.createPolygonTrade(bridgeTrade).pipe(
      tap(receipt => {
        this.bridgeApiService.notifyBridgeBot(
          bridgeTrade,
          receipt.transactionHash,
          this.authService.userAddress
        );
      })
    );
  }

  private createPolygonTrade(bridgeTrade: BridgeTrade): Observable<TransactionReceipt> {
    const walletAddress = this.authService.userAddress;
    const fromToken = bridgeTrade.token.tokenByBlockchain[bridgeTrade.fromBlockchain];
    const amountAbsolute = Web3Public.toWei(bridgeTrade.amount, fromToken.decimals);

    const onTradeTransactionHash = async (hash: string) => {
      if (bridgeTrade.onTransactionHash) {
        bridgeTrade.onTransactionHash(hash);
      }
      await this.bridgeApiService.postPolygonTransaction(
        bridgeTrade,
        TRANSACTION_STATUS.DEPOSIT_IN_PROGRESS,
        hash,
        walletAddress
      );
    };

    if (bridgeTrade.fromBlockchain === BLOCKCHAIN_NAME.ETHEREUM) {
      if (Web3Public.isNativeAddress(fromToken.address)) {
        return from(
          this.web3PrivateService.tryExecuteContractMethod(
            posRootChainManagerAddress,
            posRootChainManagerAbi,
            'depositEtherFor',
            [walletAddress],
            {
              value: amountAbsolute,
              onTransactionHash: onTradeTransactionHash
            }
          )
        );
      }

      return from(
        Web3Pure.encodeParameter('uint256', amountAbsolute).then(encodedAmount =>
          this.web3PrivateService.tryExecuteContractMethod(
            posRootChainManagerAddress,
            posRootChainManagerAbi,
            'depositFor',
            [walletAddress, fromToken.address, encodedAmount],
            {
              onTransactionHash: onTradeTransactionHash
            }
          )
        )
      );
    }

    return from(
      this.web3PrivateService.tryExecuteContractMethod(
        fromToken.address,
        UChild_ERC20_ABI,
        'withdraw',
        [amountAbsolute],
        {
          onTransactionHash: onTradeTransactionHash
        }
      )
    );
  }
}
