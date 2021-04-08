import { Injectable } from '@angular/core';
import { List } from 'immutable';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { switchMap } from 'rxjs/operators';
import { BlockchainBridgeProvider } from '../blockchain-bridge-provider';
import { BlockchainsTokens, BridgeToken } from '../../../models/BridgeToken';
import { BLOCKCHAIN_NAME } from '../../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import { Web3Public } from '../../../../../core/services/blockchain/web3-public-service/Web3Public';
import { Web3PublicService } from '../../../../../core/services/blockchain/web3-public-service/web3-public.service';
import SwapToken from '../../../../../shared/models/tokens/SwapToken';
import { BridgeTrade } from '../../../models/BridgeTrade';

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

  constructor(private httpClient: HttpClient, private web3PublicService: Web3PublicService) {
    super();
    this.web3PublicEth = this.web3PublicService[BLOCKCHAIN_NAME.ETHEREUM];
    this.web3PublicMatic = this.web3PublicService[BLOCKCHAIN_NAME.POLYGON];
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
      console.error('Error getting polygon tokens:', err, token.rootToken, token.childToken);
      return null;
    }
  }

  public getFee(): Observable<number> {
    return of(0);
  }

  public createTrade(bridgeTrade: BridgeTrade): Observable<string> {
    return undefined;
  }
}
