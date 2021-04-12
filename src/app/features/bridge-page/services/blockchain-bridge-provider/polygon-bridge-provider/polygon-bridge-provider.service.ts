import { Injectable } from '@angular/core';
import { List } from 'immutable';
import { defer, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { switchMap } from 'rxjs/operators';
import { MaticPOSClient } from '@maticnetwork/maticjs';
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

  private readonly web3PublicMatic: Web3Public;

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
    this.web3PublicMatic = this.web3PublicService[BLOCKCHAIN_NAME.POLYGON];

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
    try {
      const ethAddress = token.rootToken.toLowerCase();
      const polygonAddress = token.childToken.toLowerCase();

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
        (await this.web3PublicMatic.getTokenInfo(polygonAddress));

      return {
        symbol: ethToken.symbol,
        image: ethToken.image,

        blockchainToken: {
          [BLOCKCHAIN_NAME.ETHEREUM]: {
            address: ethToken.address,
            name: ethToken.name,
            symbol: ethToken.symbol,
            decimal: ethToken.decimals,

            minAmount: 0,
            maxAmount: Infinity
          },
          [BLOCKCHAIN_NAME.POLYGON]: {
            address: polygonToken.address,
            name: polygonToken.name,
            symbol: polygonToken.symbol,
            decimal: polygonToken.decimals,

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

  public createTrade(bridgeTrade: BridgeTrade): Observable<string> {
    const { token } = bridgeTrade;
    const maticPOSClient = this.getMaticPOSClient(bridgeTrade.fromBlockchain);
    const tokenAddress = token.blockchainToken[bridgeTrade.fromBlockchain].address;
    const decimals = token.blockchainToken[bridgeTrade.fromBlockchain].decimal;

    const userAddress = this.web3PrivateService.address;
    const amountInWei = bridgeTrade.amount.multipliedBy(10 ** decimals);

    const onTradeTransactionHash = async (hash: string): Promise<void> => {
      if (bridgeTrade.onTransactionHash) {
        bridgeTrade.onTransactionHash(hash);
      }

      await this.bridgeApiService.postPolygonTransaction(
        bridgeTrade,
        hash,
        this.web3PrivateService.address
      );
    };

    if (bridgeTrade.fromBlockchain === BLOCKCHAIN_NAME.ETHEREUM) {
      if (token.blockchainToken[BLOCKCHAIN_NAME.ETHEREUM].symbol === 'ETH') {
        return defer(async () => {
          const receipt = await maticPOSClient.depositEtherForUser(
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

      return defer(async () => {
        const allowance = await maticPOSClient.getERC20Allowance(userAddress, tokenAddress);
        if (amountInWei.gt(allowance)) {
          await maticPOSClient.approveMaxERC20ForDeposit(tokenAddress, {
            from: userAddress,
            onTransactionHash: bridgeTrade.onTransactionHash
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

    // bridgeTrade.fromBlockchain === BLOCKCHAIN_NAME.POLYGON
    // TODO implement POL -> ETH
    return null;
  }
}
