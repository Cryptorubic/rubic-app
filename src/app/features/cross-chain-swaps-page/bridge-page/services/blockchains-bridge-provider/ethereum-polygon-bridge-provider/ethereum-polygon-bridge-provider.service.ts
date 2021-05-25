import { Injectable } from '@angular/core';
import { List } from 'immutable';
import { defer, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MaticPOSClient } from '@maticnetwork/maticjs';
import BigNumber from 'bignumber.js';
import { switchMap, tap } from 'rxjs/operators';
import { Web3Public } from 'src/app/core/services/blockchain/web3-public-service/Web3Public';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';
import { Web3PrivateService } from 'src/app/core/services/blockchain/web3-private-service/web3-private.service';
import { BridgeApiService } from 'src/app/core/services/backend/bridge-api/bridge-api.service';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import { MetamaskProviderService } from 'src/app/core/services/blockchain/private-provider/metamask-provider/metamask-provider.service';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { NATIVE_TOKEN_ADDRESS } from 'src/app/shared/constants/blockchain/NATIVE_TOKEN_ADDRESS';
import { TRADE_STATUS } from 'src/app/core/services/backend/bridge-api/models/TRADE_STATUS';
import SwapToken from 'src/app/shared/models/tokens/SwapToken';
import {
  BlockchainsTokens,
  BridgeToken
} from 'src/app/features/cross-chain-swaps-page/bridge-page/models/BridgeToken';
import networks from 'src/app/shared/constants/blockchain/networks';
import { BridgeTrade } from 'src/app/features/cross-chain-swaps-page/bridge-page/models/BridgeTrade';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/provider-connector/provider-connector.service';
import { BlockchainsBridgeProvider } from '../blockchains-bridge-provider';
import { BlockchainsTokens, BridgeToken } from '../../../models/BridgeToken';
import { BLOCKCHAIN_NAME } from '../../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import { Web3Public } from '../../../../../core/services/blockchain/web3-public-service/Web3Public';
import { Web3PublicService } from '../../../../../core/services/blockchain/web3-public-service/web3-public.service';
import SwapToken from '../../../../../shared/models/tokens/SwapToken';
import { BridgeTrade } from '../../../models/BridgeTrade';
import networks from '../../../../../shared/constants/blockchain/networks';
import { Web3PrivateService } from '../../../../../core/services/blockchain/web3-private-service/web3-private.service';
import { UseTestingModeService } from '../../../../../core/services/use-testing-mode/use-testing-mode.service';
import { BridgeApiService } from '../../../../../core/services/backend/bridge-api/bridge-api.service';
import { NATIVE_TOKEN_ADDRESS } from '../../../../../shared/constants/blockchain/NATIVE_TOKEN_ADDRESS';
import { TRADE_STATUS } from '../../../../../core/services/backend/bridge-api/models/TRADE_STATUS';

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
    private httpClient: HttpClient,
    private web3PublicService: Web3PublicService,
    private web3PrivateService: Web3PrivateService,
    private bridgeApiService: BridgeApiService,
    private useTestingModeService: UseTestingModeService,
    private readonly providerConnectorService: ProviderConnectorService
  ) {
    super();
    this.web3PublicEth = this.web3PublicService[BLOCKCHAIN_NAME.ETHEREUM];
    this.web3PublicPolygon = this.web3PublicService[BLOCKCHAIN_NAME.POLYGON];

    this.useTestingModeService.isTestingMode.subscribe(isTestingMode => {
      this.isTestingMode = isTestingMode;
    });
  }

  public getTokensList(swapTokens: List<SwapToken>): Observable<List<BridgeToken>> {
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

    return this.httpClient
      .post(this.polygonGraphApiUrl, {
        query
      })
      .pipe(
        switchMap(async (response: PolygonGraphResponse) => {
          const posTokens = response.data.tokenMappings;
          const promisesTokens = [];
          posTokens.forEach(token =>
            promisesTokens.push(this.parsePolygonTokens(token, swapTokens))
          );
          const tokens = await Promise.all(promisesTokens);
          return List(
            tokens.filter(
              t =>
                t !== null &&
                t.blockchainToken[BLOCKCHAIN_NAME.ETHEREUM].address.toLowerCase() !==
                  this.RBC_ADDRESS_IN_ETHEREUM.toLowerCase()
            )
          );
        })
      );
  }

  private async parsePolygonTokens(
    token: PolygonGraphToken,
    swapTokens: List<SwapToken>
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
      const ethToken =
        swapTokens
          .filter(item => item.blockchain === BLOCKCHAIN_NAME.ETHEREUM)
          .find(swapToken => swapToken.address.toLowerCase() === ethAddress.toLowerCase()) ||
        (await this.web3PublicEth.getTokenInfo(ethAddress));
      const polygonToken =
        swapTokens
          .filter(item => item.blockchain === BLOCKCHAIN_NAME.POLYGON)
          .find(swapToken => swapToken.address.toLowerCase() === polygonAddress.toLowerCase()) ||
        (await this.web3PublicPolygon.getTokenInfo(polygonAddress));

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
      console.debug('Error getting polygon tokens:', err, token.rootToken, token.childToken);
      return null;
    }
  }

  public getFee(): Observable<number> {
    return of(0);
  }

  private getMaticPOSClient(fromBlockchain: BLOCKCHAIN_NAME): MaticPOSClient {
    let ethRPC: string;
    let maticRPC: string;
    let network: string;
    let version: string;
    if (!this.isTestingMode) {
      ethRPC = networks.find(n => n.name === BLOCKCHAIN_NAME.ETHEREUM).rpcLink;
      maticRPC = networks.find(n => n.name === BLOCKCHAIN_NAME.POLYGON).rpcLink;
      network = 'mainnet';
      version = 'v1';
    } else {
      ethRPC = networks.find(n => n.name === BLOCKCHAIN_NAME.GOERLI_TESTNET).rpcLink;
      maticRPC = networks.find(n => n.name === BLOCKCHAIN_NAME.POLYGON_TESTNET).rpcLink;
      network = 'testnet';
      version = 'mumbai';
    }

    if (fromBlockchain === BLOCKCHAIN_NAME.ETHEREUM) {
      return new MaticPOSClient({
        network,
        version,
        maticProvider: maticRPC,
        parentProvider: this.providerConnectorService.provider
      });
    }
    return new MaticPOSClient({
      network,
      version,
      maticProvider: this.providerConnectorService.provider,
      parentProvider: ethRPC
    });
  }

  public createTrade(
    bridgeTrade: BridgeTrade,
    updateTransactionsList: () => Promise<void>
  ): Observable<string> {
    return this.createPolygonTrade(bridgeTrade, updateTransactionsList).pipe(
      tap(transactionHash => {
        this.bridgeApiService.notifyBridgeBot(
          bridgeTrade,
          transactionHash,
          this.web3PrivateService.address
        );
      })
    );
  }

  public createPolygonTrade(
    bridgeTrade: BridgeTrade,
    updateTransactionsList: () => Promise<void>
  ): Observable<string> {
    const maticPOSClient = this.getMaticPOSClient(bridgeTrade.fromBlockchain);
    const userAddress = this.web3PrivateService.address;

    const { token } = bridgeTrade;
    const tokenAddress = token.blockchainToken[bridgeTrade.fromBlockchain].address;
    const { decimals } = token.blockchainToken[bridgeTrade.fromBlockchain];
    const amountInWei = bridgeTrade.amount.multipliedBy(10 ** decimals);

    const onTradeTransactionHashFactory = (status: TRADE_STATUS) => {
      return async (hash: string) => {
        if (bridgeTrade.onTransactionHash) {
          bridgeTrade.onTransactionHash(hash);
        }
        await this.bridgeApiService.postPolygonTransaction(
          bridgeTrade,
          status,
          hash,
          this.web3PrivateService.address
        );
        updateTransactionsList();
      };
    };

    if (bridgeTrade.fromBlockchain === BLOCKCHAIN_NAME.ETHEREUM) {
      const onTradeTransactionHash = onTradeTransactionHashFactory(
        TRADE_STATUS.DEPOSIT_IN_PROGRESS
      );
      if (token.blockchainToken[BLOCKCHAIN_NAME.ETHEREUM].symbol === 'ETH') {
        return this.depositEther(maticPOSClient, userAddress, amountInWei, onTradeTransactionHash);
      }
      return this.depositERC20(
        maticPOSClient,
        userAddress,
        tokenAddress,
        amountInWei,
        bridgeTrade.onTransactionHash,
        onTradeTransactionHash
      );
    }

    const onTradeTransactionHash = onTradeTransactionHashFactory(TRADE_STATUS.DEPOSIT_IN_PROGRESS);
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
  ): Observable<string> {
    return defer(async () => {
      const receipt = await maticPOSClient.depositEtherForUser(userAddress, amountInWei.toFixed(), {
        from: userAddress,
        onTransactionHash: onTradeTransactionHash
      });
      return receipt.transactionHash;
    });
  }

  private depositERC20(
    maticPOSClient: MaticPOSClient,
    userAddress: string,
    tokenAddress: string,
    amountInWei: BigNumber,
    onApprove: (hash: string) => void,
    onTradeTransactionHash: (hash: string) => void
  ): Observable<string> {
    return defer(async () => {
      const allowance = await maticPOSClient.getERC20Allowance(userAddress, tokenAddress);
      if (amountInWei.gt(allowance)) {
        await maticPOSClient.approveMaxERC20ForDeposit(tokenAddress, {
          from: userAddress,
          onTransactionHash: onApprove
        });
      }
      const receipt = await maticPOSClient.depositERC20ForUser(
        tokenAddress,
        userAddress,
        amountInWei.toFixed(),
        {
          from: userAddress,
          onTransactionHash: onTradeTransactionHash
        }
      );
      return receipt.transactionHash;
    });
  }

  private burnERC20(
    maticPOSClient: MaticPOSClient,
    userAddress: string,
    tokenAddress: string,
    amountInWei: BigNumber,
    onTradeTransactionHash: (hash: string) => void
  ): Observable<string> {
    return defer(async () => {
      const receipt = await maticPOSClient.burnERC20(tokenAddress, amountInWei.toFixed(), {
        from: userAddress,
        onTransactionHash: onTradeTransactionHash
      });
      return receipt.transactionHash;
    });
  }

  public depositTradeAfterCheckpoint(
    burnTransactionHash: string,
    onTransactionHash: (hash: string) => void,
    updateTransactionsList: () => Promise<void>
  ): Observable<string> {
    const maticPOSClient = this.getMaticPOSClient(BLOCKCHAIN_NAME.ETHEREUM);
    const userAddress = this.web3PrivateService.address;

    const onTradeTransactionHash = async (hash: string) => {
      if (onTransactionHash) {
        onTransactionHash(hash);
      }
      await this.bridgeApiService.patchPolygonTransaction(
        burnTransactionHash,
        hash,
        TRADE_STATUS.WITHDRAW_IN_PROGRESS
      );
      updateTransactionsList();
    };

    return defer(async () => {
      const receipt = await maticPOSClient.exitERC20(burnTransactionHash, {
        from: userAddress,
        onTransactionHash: onTradeTransactionHash
      });
      await this.bridgeApiService.patchPolygonTransaction(
        burnTransactionHash,
        receipt.transactionHash,
        TRADE_STATUS.COMPLETED
      );
      return receipt.transactionHash;
    });
  }
}
