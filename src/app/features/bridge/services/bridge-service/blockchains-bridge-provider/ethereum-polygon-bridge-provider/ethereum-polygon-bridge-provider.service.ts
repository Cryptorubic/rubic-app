import { Injectable } from '@angular/core';
import { List } from 'immutable';
import { defer, from, Observable, of, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MaticPOSClient } from '@maticnetwork/maticjs';
import BigNumber from 'bignumber.js';
import { catchError, filter, first, map, switchMap, tap } from 'rxjs/operators';
import { Web3Public } from 'src/app/core/services/blockchain/web3-public-service/Web3Public';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';
import { Web3PrivateService } from 'src/app/core/services/blockchain/web3-private-service/web3-private.service';
import { BridgeApiService } from 'src/app/core/services/backend/bridge-api/bridge-api.service';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/provider-connector/provider-connector.service';
import { TransactionReceipt } from 'web3-eth';
import { BlockchainsTokens, BridgeToken } from 'src/app/features/bridge/models/BridgeToken';
import { NATIVE_TOKEN_ADDRESS } from 'src/app/shared/constants/blockchain/NATIVE_TOKEN_ADDRESS';
import { BridgeTrade } from 'src/app/features/bridge/models/BridgeTrade';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { TRANSACTION_STATUS } from 'src/app/shared/models/blockchain/TRANSACTION_STATUS';
import { BRIDGE_PROVIDER } from 'src/app/shared/models/bridge/BRIDGE_PROVIDER';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { UndefinedError } from 'src/app/core/errors/models/undefined.error';
import { UserRejectError } from 'src/app/core/errors/models/provider/UserRejectError';
import networks from '../../../../../../shared/constants/blockchain/networks';
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

@Injectable()
export class EthereumPolygonBridgeProviderService extends BlockchainsBridgeProvider {
  private readonly polygonGraphApiUrl =
    'https://api.thegraph.com/subgraphs/name/maticnetwork/mainnet-root-subgraphs';

  private readonly ERC20_TOKEN_TYPE =
    '0x8ae85d849167ff996c04040c44924fd364217285e4cad818292c7ac37c0a345b';

  private readonly RBC_ADDRESS_IN_ETHEREUM = '0xa4eed63db85311e22df4473f87ccfc3dadcfa3e3';

  private readonly web3PublicEth: Web3Public;

  private readonly web3PublicPolygon: Web3Public;

  private isTestingMode = false;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly web3PublicService: Web3PublicService,
    private readonly web3PrivateService: Web3PrivateService,
    private readonly bridgeApiService: BridgeApiService,
    private readonly useTestingModeService: UseTestingModeService,
    private readonly providerConnectorService: ProviderConnectorService,
    private readonly tokensService: TokensService,
    private readonly authService: AuthService
  ) {
    super();

    this.tokensService.tokens
      .pipe(
        filter(tokens => !!tokens.size),
        first()
      )
      .subscribe(tokenAmounts => {
        this.getTokensList(tokenAmounts);
      });

    this.web3PublicEth = this.web3PublicService[BLOCKCHAIN_NAME.ETHEREUM];
    this.web3PublicPolygon = this.web3PublicService[BLOCKCHAIN_NAME.POLYGON];

    useTestingModeService.isTestingMode.subscribe(isTestingMode => {
      this.isTestingMode = isTestingMode;
    });
  }

  private getTokensList(tokenAmounts: List<TokenAmount>): void {
    const query = `{
      tokenMappings(
        first: 1000,
        where: {
          isPOS: true,
          tokenType: "${this.ERC20_TOKEN_TYPE}"
        }
      ) {
        rootToken
        childToken
        isPOS
      }
    }`;

    this.httpClient
      .post(this.polygonGraphApiUrl, {
        query
      })
      .subscribe(
        async (response: PolygonGraphResponse) => {
          if (!response.data) {
            this.tokens$.next(List([]));
            return;
          }

          const posTokens = response.data.tokenMappings;
          const promisesTokens = [];

          posTokens.forEach(token =>
            promisesTokens.push(this.parsePolygonTokens(token, tokenAmounts))
          );
          const tokens = await Promise.all(promisesTokens);

          this.tokens$.next(
            List(
              tokens.filter(
                t =>
                  t !== null &&
                  t.blockchainToken[BLOCKCHAIN_NAME.ETHEREUM].address.toLowerCase() !==
                    this.RBC_ADDRESS_IN_ETHEREUM.toLowerCase()
              )
            )
          );
        },
        err => {
          console.debug('Error retrieving polygon tokens: ', err);
          this.tokens$.next(List([]));
        }
      );
  }

  private async parsePolygonTokens(
    token: PolygonGraphToken,
    tokenAmounts: List<TokenAmount>
  ): Promise<BridgeToken> {
    const ethAddress = token.rootToken;
    let polygonAddress = token.childToken;

    // Mapping from API for ETH token is wrong
    if (ethAddress === NATIVE_TOKEN_ADDRESS) {
      polygonAddress = '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619';
    }

    // Mapping from API for MATIC token is wrong
    if (polygonAddress === NATIVE_TOKEN_ADDRESS) {
      return null;
    }

    try {
      const ethToken = tokenAmounts
        .filter(item => item.blockchain === BLOCKCHAIN_NAME.ETHEREUM)
        .find(tokenAmount => tokenAmount.address.toLowerCase() === ethAddress.toLowerCase());
      const polygonToken = tokenAmounts
        .filter(item => item.blockchain === BLOCKCHAIN_NAME.POLYGON)
        .find(tokenAmount => tokenAmount.address.toLowerCase() === polygonAddress.toLowerCase());

      if (!ethToken || !polygonToken) {
        return null;
      }

      return {
        symbol: ethToken.symbol,
        image: '',
        rank: 0,

        blockchainToken: {
          [BLOCKCHAIN_NAME.ETHEREUM]: {
            address: ethToken.address,
            name: ethToken.name,
            symbol: ethToken.symbol,
            decimals: ethToken.decimals,

            minAmount: 0,
            maxAmount: Infinity
          },
          [BLOCKCHAIN_NAME.POLYGON]: {
            address: polygonToken.address,
            name: polygonToken.name,
            symbol: polygonToken.symbol,
            decimals: polygonToken.decimals,

            minAmount: 0,
            maxAmount: Infinity
          }
        } as BlockchainsTokens,

        fromEthFee: 0,
        toEthFee: 0
      };
    } catch (err) {
      // tslint:disable-next-line:no-console
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

  private getMaticPOSClient(fromBlockchain: BLOCKCHAIN_NAME): MaticPOSClient {
    const ethRPC = networks.find(n => n.name === BLOCKCHAIN_NAME.ETHEREUM).rpcLink;
    const maticRPC = networks.find(n => n.name === BLOCKCHAIN_NAME.POLYGON).rpcLink;
    const network = 'mainnet';
    const version = 'v1';

    if (fromBlockchain === BLOCKCHAIN_NAME.ETHEREUM) {
      return new MaticPOSClient({
        network,
        version,
        maticProvider: maticRPC,
        parentProvider: this.providerConnectorService.web3
      });
    }
    return new MaticPOSClient({
      network,
      version,
      maticProvider: this.providerConnectorService.web3,
      parentProvider: ethRPC
    });
  }

  public createTrade(bridgeTrade: BridgeTrade): Observable<TransactionReceipt> {
    return this.createPolygonTrade(bridgeTrade).pipe(
      tap(receipt => {
        this.bridgeApiService.notifyBridgeBot(
          bridgeTrade,
          receipt.transactionHash,
          this.providerConnectorService.address
        );
      }),
      catchError(err => {
        if (err.code === 4001) {
          return throwError(new UserRejectError());
        }
        return throwError(err);
      })
    );
  }

  public needApprove(bridgeTrade: BridgeTrade): Observable<boolean> {
    if (bridgeTrade.fromBlockchain !== BLOCKCHAIN_NAME.ETHEREUM) {
      return of(false);
    }

    const maticPOSClient = this.getMaticPOSClient(BLOCKCHAIN_NAME.ETHEREUM);
    const userAddress = this.authService.user.address;
    const tokenAddress = bridgeTrade.token.blockchainToken[BLOCKCHAIN_NAME.ETHEREUM].address;
    const { decimals } = bridgeTrade.token.blockchainToken[BLOCKCHAIN_NAME.ETHEREUM];
    const amountInWei = bridgeTrade.amount.multipliedBy(10 ** decimals);
    if (bridgeTrade.token.blockchainToken[BLOCKCHAIN_NAME.ETHEREUM].symbol === 'ETH') {
      return of(false);
    }
    return from(maticPOSClient.getERC20Allowance(userAddress, tokenAddress)).pipe(
      map(allowance => amountInWei.gt(allowance))
    );
  }

  public approve(bridgeTrade: BridgeTrade): Observable<TransactionReceipt> {
    const maticPOSClient = this.getMaticPOSClient(bridgeTrade.fromBlockchain);
    const userAddress = this.authService.user.address;
    const tokenAddress = bridgeTrade.token.blockchainToken[bridgeTrade.fromBlockchain].address;

    return this.needApprove(bridgeTrade).pipe(
      switchMap(needApprove => {
        if (!needApprove) {
          console.error('You should check bridge trade allowance before approve');
          return throwError(new UndefinedError());
        }
        return from(
          maticPOSClient.approveMaxERC20ForDeposit(tokenAddress, {
            from: userAddress,
            onTransactionHash: bridgeTrade.onTransactionHash
          })
        ) as Observable<TransactionReceipt>;
      })
    );
  }

  private createPolygonTrade(bridgeTrade: BridgeTrade): Observable<TransactionReceipt> {
    const maticPOSClient = this.getMaticPOSClient(bridgeTrade.fromBlockchain);
    const userAddress = this.providerConnectorService.address;

    const { token } = bridgeTrade;
    const tokenAddress = token.blockchainToken[bridgeTrade.fromBlockchain].address;
    const { decimals } = token.blockchainToken[bridgeTrade.fromBlockchain];
    const amountInWei = bridgeTrade.amount.multipliedBy(10 ** decimals);

    const onTradeTransactionHashFactory = (status: TRANSACTION_STATUS) => {
      return async (hash: string) => {
        if (bridgeTrade.onTransactionHash) {
          bridgeTrade.onTransactionHash(hash);
        }
        await this.bridgeApiService.postPolygonTransaction(
          bridgeTrade,
          status,
          hash,
          this.providerConnectorService.address
        );
      };
    };

    if (bridgeTrade.fromBlockchain === BLOCKCHAIN_NAME.ETHEREUM) {
      const onTradeTransactionHashFn = onTradeTransactionHashFactory(
        TRANSACTION_STATUS.DEPOSIT_IN_PROGRESS
      );
      if (token.blockchainToken[BLOCKCHAIN_NAME.ETHEREUM].symbol === 'ETH') {
        return this.depositEther(
          maticPOSClient,
          userAddress,
          amountInWei,
          onTradeTransactionHashFn
        );
      }
      return this.depositERC20(
        maticPOSClient,
        userAddress,
        tokenAddress,
        amountInWei,
        bridgeTrade.onTransactionHash,
        onTradeTransactionHashFn
      );
    }

    const onTradeTransactionHash = onTradeTransactionHashFactory(
      TRANSACTION_STATUS.DEPOSIT_IN_PROGRESS
    );
    return this.burnERC20(
      maticPOSClient,
      userAddress,
      tokenAddress,
      amountInWei,
      onTradeTransactionHash
    );
  }

  private depositEther(
    maticPOSClient: MaticPOSClient,
    userAddress: string,
    amountInWei: BigNumber,
    onTradeTransactionHash: (hash: string) => void
  ): Observable<TransactionReceipt> {
    return defer(() => {
      return maticPOSClient.depositEtherForUser(userAddress, amountInWei.toFixed(), {
        from: userAddress,
        onTransactionHash: onTradeTransactionHash
      });
    });
  }

  private depositERC20(
    maticPOSClient: MaticPOSClient,
    userAddress: string,
    tokenAddress: string,
    amountInWei: BigNumber,
    onApprove: (hash: string) => void,
    onTradeTransactionHash: (hash: string) => void
  ): Observable<TransactionReceipt> {
    return defer(async () => {
      const allowance = await maticPOSClient.getERC20Allowance(userAddress, tokenAddress);
      if (amountInWei.gt(allowance)) {
        await maticPOSClient.approveMaxERC20ForDeposit(tokenAddress, {
          from: userAddress,
          onTransactionHash: onApprove
        });
      }
      return maticPOSClient.depositERC20ForUser(tokenAddress, userAddress, amountInWei.toFixed(), {
        from: userAddress,
        onTransactionHash: onTradeTransactionHash
      });
    });
  }

  private burnERC20(
    maticPOSClient: MaticPOSClient,
    userAddress: string,
    tokenAddress: string,
    amountInWei: BigNumber,
    onTradeTransactionHash: (hash: string) => void
  ): Observable<TransactionReceipt> {
    return defer(async () => {
      return maticPOSClient.burnERC20(tokenAddress, amountInWei.toFixed(), {
        from: userAddress,
        onTransactionHash: onTradeTransactionHash
      });
    });
  }
}
