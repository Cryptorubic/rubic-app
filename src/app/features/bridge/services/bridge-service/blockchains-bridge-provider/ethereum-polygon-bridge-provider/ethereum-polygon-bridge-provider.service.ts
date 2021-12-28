import { Injectable } from '@angular/core';
import { List } from 'immutable';
import { from, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { first, tap, timeout } from 'rxjs/operators';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { EthLikeWeb3PrivateService } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-private/eth-like-web3-private.service';
import { BridgeApiService } from 'src/app/core/services/backend/bridge-api/bridge-api.service';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { TransactionReceipt } from 'web3-eth';
import { BridgeTokenPair } from '@features/bridge/models/bridge-token-pair';
import { NativeTokenAddress } from '@shared/constants/blockchain/native-token-address';
import { BridgeTrade } from '@features/bridge/models/bridge-trade';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { TRANSACTION_STATUS } from '@shared/models/blockchain/transaction-status';
import { BRIDGE_PROVIDER } from '@shared/models/bridge/bridge-provider';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { EthLikeWeb3Public } from 'src/app/core/services/blockchain/blockchain-adapters/eth-like/web3-public/eth-like-web3-public';
import PosRootChainManagerAbiI from '@features/bridge/services/bridge-service/blockchains-bridge-provider/ethereum-polygon-bridge-provider/constants/pos-root-chain-manager-contract/pos-root-chain-manager-abiI';
import PosRootChainManagerAddresses from '@features/bridge/services/bridge-service/blockchains-bridge-provider/ethereum-polygon-bridge-provider/constants/pos-root-chain-manager-contract/pos-root-chain-manager-addresses';
import { compareAddresses } from 'src/app/shared/utils/utils';
import { PCacheable } from 'ts-cacheable';
import Uchild_erc20Abi from '@features/bridge/services/bridge-service/blockchains-bridge-provider/ethereum-polygon-bridge-provider/constants/uchild_erc20/uchild_erc20-abi';
import { EthLikeWeb3Pure } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-pure/eth-like-web3-pure';
import { BlockchainsBridgeProvider } from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/common/blockchains-bridge-provider';
import { Web3Pure } from '@core/services/blockchain/blockchain-adapters/common/web3-pure';

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
  private readonly ethBlockchainAdapter: EthLikeWeb3Public;

  private readonly polygonBlockchainAdapter: EthLikeWeb3Public;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly publicBlockchainAdapterService: PublicBlockchainAdapterService,
    private readonly web3PrivateService: EthLikeWeb3PrivateService,
    private readonly bridgeApiService: BridgeApiService,
    private readonly tokensService: TokensService,
    private readonly authService: AuthService
  ) {
    super();
    this.ethBlockchainAdapter = this.publicBlockchainAdapterService[BLOCKCHAIN_NAME.ETHEREUM];
    this.polygonBlockchainAdapter = this.publicBlockchainAdapterService[BLOCKCHAIN_NAME.POLYGON];

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
      .pipe(timeout(3000))
      .subscribe(
        (response: PolygonGraphResponse) => {
          if (!response.data) {
            this._tokenPairs$.next(List([]));
            return;
          }

          const posTokens = response.data.tokenMappings;
          const bridgeTokenPairs = posTokens.map(token =>
            this.parsePolygonTokens(token, tokenAmounts)
          );

          this._tokenPairs$.next(
            List(bridgeTokenPairs.filter(bridgeTokenPair => bridgeTokenPair !== null))
          );
        },
        (err: unknown) => {
          console.debug('Error retrieving polygon tokens: ', err);
          this._tokenPairs$.next(List([]));
        }
      );
  }

  private parsePolygonTokens(
    token: PolygonGraphToken,
    tokenAmounts: List<TokenAmount>
  ): BridgeTokenPair {
    const ethAddress = token.rootToken;
    let polygonAddress = token.childToken;

    // Mapping for ETH native token is corrected
    if (ethAddress === NativeTokenAddress) {
      polygonAddress = '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619';
    }

    // Mapping for MATIC native token is incorrect
    if (polygonAddress === NativeTokenAddress) {
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
    const tokenType = await this.ethBlockchainAdapter.callContractMethod(
      PosRootChainManagerAddresses,
      PosRootChainManagerAbiI,
      'tokenToType',
      { methodArguments: [tokenAddress] }
    );
    if (!tokenType) {
      throw new Error('Invalid Tokens Type');
    }
    return await this.ethBlockchainAdapter.callContractMethod(
      PosRootChainManagerAddresses,
      PosRootChainManagerAbiI,
      'typeToPredicate',
      { methodArguments: [tokenType] }
    );
  }

  public needApprove(bridgeTrade: BridgeTrade): Observable<boolean> {
    if (bridgeTrade.fromBlockchain === BLOCKCHAIN_NAME.POLYGON) {
      return of(false);
    }

    const token = bridgeTrade.token.tokenByBlockchain[BLOCKCHAIN_NAME.ETHEREUM];
    if (this.ethBlockchainAdapter.isNativeAddress(token.address)) {
      return of(false);
    }

    return from(
      (async () => {
        const predicateAddress = await this.getPredicateAddress(token.address);
        const walletAddress = this.authService.userAddress;
        const allowance = await this.ethBlockchainAdapter.getAllowance({
          tokenAddress: token.address,
          ownerAddress: walletAddress,
          spenderAddress: predicateAddress
        });
        return bridgeTrade.amount.gt(Web3Pure.fromWei(allowance, token.decimals));
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
    const amountAbsolute = Web3Pure.toWei(bridgeTrade.amount, fromToken.decimals);

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
      if (this.ethBlockchainAdapter.isNativeAddress(fromToken.address)) {
        return from(
          this.web3PrivateService.tryExecuteContractMethod(
            PosRootChainManagerAddresses,
            PosRootChainManagerAbiI,
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
        EthLikeWeb3Pure.encodeParameter('uint256', amountAbsolute).then(encodedAmount =>
          this.web3PrivateService.tryExecuteContractMethod(
            PosRootChainManagerAddresses,
            PosRootChainManagerAbiI,
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
        Uchild_erc20Abi,
        'withdraw',
        [amountAbsolute],
        {
          onTransactionHash: onTradeTransactionHash
        }
      )
    );
  }
}
