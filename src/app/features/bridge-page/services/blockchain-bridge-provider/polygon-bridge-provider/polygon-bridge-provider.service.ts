import { Injectable } from '@angular/core';
import { List } from 'immutable';
import { defer, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { switchMap } from 'rxjs/operators';
import { MaticPOSClient } from '@maticnetwork/maticjs';
import BigNumber from 'bignumber.js';
import { BlockchainBridgeProvider } from '../blockchain-bridge-provider';
import { BlockchainsTokens, BridgeToken } from '../../../models/BridgeToken';
import { BLOCKCHAIN_NAME } from '../../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import { Web3Public } from '../../../../../core/services/blockchain/web3-public-service/Web3Public';
import { Web3PublicService } from '../../../../../core/services/blockchain/web3-public-service/web3-public.service';
import SwapToken from '../../../../../shared/models/tokens/SwapToken';
import { BridgeTrade } from '../../../models/BridgeTrade';
import networks from '../../../../../shared/constants/blockchain/networks';
import { Web3PrivateService } from '../../../../../core/services/blockchain/web3-private-service/web3-private.service';
import { UseTestingModeService } from '../../../../../core/services/use-testing-mode/use-testing-mode.service';
import { MetamaskProviderService } from '../../../../../core/services/blockchain/private-provider/metamask-provider/metamask-provider.service';
import { BridgeApiService } from '../../../../../core/services/backend/bridge-api/bridge-api.service';
import { NATIVE_TOKEN_ADDRESS } from '../../../../../shared/constants/blockchain/NATIVE_TOKEN_ADDRESS';

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
export class PolygonBridgeProviderService extends BlockchainBridgeProvider {
  private readonly polygonGraphApiUrl =
    'https://api.thegraph.com/subgraphs/name/maticnetwork/mainnet-root-subgraphs';

  private readonly ERC20_TOKEN_TYPE =
    '0x8ae85d849167ff996c04040c44924fd364217285e4cad818292c7ac37c0a345b';

  private readonly web3PublicEth: Web3Public;

  private readonly web3PublicPolygon: Web3Public;

  private isTestingMode = false;

  constructor(
    private httpClient: HttpClient,
    private web3PublicService: Web3PublicService,
    private web3PrivateService: Web3PrivateService,
    private bridgeApiService: BridgeApiService,
    private useTestingModeService: UseTestingModeService,
    private metamaskProviderService: MetamaskProviderService
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
        switchMap((response: PolygonGraphResponse) => {
          const posTokens = response.data.tokenMappings;
          const promisesTokens = [];
          posTokens.forEach(token => promisesTokens.push(this.parseMaticToken(token, swapTokens)));
          return Promise.all(promisesTokens).then(tokens => {
            return List(tokens.filter(t => t !== null));
          });
        })
      );
  }

  private async parseMaticToken(
    token: PolygonGraphToken,
    swapTokens: List<SwapToken>
  ): Promise<BridgeToken> {
    const ethAddress = token.rootToken.toLowerCase();
    let polygonAddress = token.childToken.toLowerCase();

    // Mapping from API is wrong for ETH token
    if (ethAddress === NATIVE_TOKEN_ADDRESS) {
      polygonAddress = '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619';
    }

    try {
      const ethToken = swapTokens
        .filter(item => item.blockchain === BLOCKCHAIN_NAME.ETHEREUM)
        .find(swapToken => swapToken.address.toLowerCase() === ethAddress) || {
        ...(await this.web3PublicEth.getTokenInfo(ethAddress)),
        image: ''
      };
      const polygonToken =
        swapTokens
          .filter(item => item.blockchain === BLOCKCHAIN_NAME.POLYGON)
          .find(swapToken => swapToken.address.toLowerCase() === polygonAddress) ||
        (await this.web3PublicPolygon.getTokenInfo(polygonAddress));

      return {
        symbol: ethToken.symbol,
        image: ethToken.image,

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
        parentProvider: this.metamaskProviderService.web3
      });
    }
    return new MaticPOSClient({
      network,
      version,
      maticProvider: this.metamaskProviderService.web3,
      parentProvider: ethRPC
    });
  }

  public createTrade(
    bridgeTrade: BridgeTrade,
    updateTransactionsList: () => Promise<void>
  ): Observable<string> {
    const maticPOSClient = this.getMaticPOSClient(bridgeTrade.fromBlockchain);
    const userAddress = this.web3PrivateService.address;

    const { token } = bridgeTrade;
    const tokenAddress = token.blockchainToken[bridgeTrade.fromBlockchain].address;
    const { decimals } = token.blockchainToken[bridgeTrade.fromBlockchain];
    const amountInWei = bridgeTrade.amount.multipliedBy(10 ** decimals);

    const onTradeTransactionHashFactory = (status: string) => {
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
      const onTradeTransactionHash = onTradeTransactionHashFactory('DepositInProgress');
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

    const onTradeTransactionHash = onTradeTransactionHashFactory('WithdrawInProgress');
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
      await this.bridgeApiService.patchPolygonTransaction(burnTransactionHash, 'DepositInProgress');
      updateTransactionsList();
    };

    return defer(async () => {
      const receipt = await maticPOSClient.exitERC20(burnTransactionHash, {
        from: userAddress,
        onTransactionHash: onTradeTransactionHash
      });
      return receipt.transactionHash;
    });
  }
}
