import { Injectable } from '@angular/core';
import BigNumber from 'bignumber.js';
import { HttpClient } from '@angular/common/http';
import { List } from 'immutable';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { BlockchainBridgeProvider } from '../../blockchain-bridge-provider';
import { Web3PrivateService } from '../../../../../../core/services/blockchain/web3-private-service/web3-private.service';
import { Web3PublicService } from '../../../../../../core/services/blockchain/web3-public-service/web3-public.service';
import { UseTestingModeService } from '../../../../../../core/services/use-testing-mode/use-testing-mode.service';
import { BlockchainsTokens, BridgeToken } from '../../../../models/BridgeToken';
import { BLOCKCHAIN_NAME } from '../../../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import { BridgeApiService } from '../../../../../../core/services/backend/bridge-api/bridge-api.service';
import { Web3Public } from '../../../../../../core/services/blockchain/web3-public-service/Web3Public';
import EthereumContractAbi from './abi/EthereumContractAbi';
import BinanceContractAbi from './abi/BinanceContractAbi';
import InsufficientFundsError from '../../../../../../shared/models/errors/instant-trade/InsufficientFundsError';
import { BridgeTrade } from '../../../../models/BridgeTrade';

interface RubicTrade {
  token: {
    address: string;
    decimals: number;
    symbol: string;
  };
  amount: BigNumber;
  swapContractAddress: string;
  swapContractAbi: any[];
}

@Injectable()
export class RubicBridgeProviderService extends BlockchainBridgeProvider {
  private static readonly RubicMaxAmount = 50000;

  private readonly apiUrl = 'https://swap.rubic.exchange/api/v1/';

  private EthereumSmartContractAddress = '0x8E3BCC334657560253B83f08331d85267316e08a';

  private BinanceSmartContractAddress = '0xE77b0E832A58aFc2fcDaed060E8D701d97533086';

  constructor(
    private httpClient: HttpClient,
    private web3PrivateService: Web3PrivateService,
    private web3PublicService: Web3PublicService,
    private bridgeApiService: BridgeApiService,
    useTestingMode: UseTestingModeService
  ) {
    super();
    useTestingMode.isTestingMode.subscribe(value => {
      if (value) {
        this.EthereumSmartContractAddress = '0xd806e441b27f4f827710469b0acb4e045e62b676';
        this.BinanceSmartContractAddress = '0x17caca02ddf472f62bfed5165facf7a6b5c72926';
      }
    });
  }

  public getTokensList(): Observable<List<BridgeToken>> {
    return this.loadRubicTokenInfo().pipe(map(rubicToken => List([rubicToken])));
  }

  public loadRubicTokenInfo(): Observable<BridgeToken> {
    return this.httpClient.get(`${this.apiUrl}dex/Rubic/`).pipe(
      map((response: any) => ({
        symbol: 'RBC',
        image: '',

        blockchainToken: {
          [BLOCKCHAIN_NAME.ETHEREUM]: {
            address: response.tokens[0].token_address,
            name: 'RBC',
            symbol: response.tokens[0].symbol,
            decimals: response.tokens[0].decimals,

            minAmount: response.min_swap_amount,
            maxAmount: RubicBridgeProviderService.RubicMaxAmount
          },
          [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
            address: response.tokens[1].token_address,
            name: 'RBC',
            symbol: response.tokens[1].symbol,
            decimals: response.tokens[1].decimals,

            minAmount: response.min_swap_amount,
            maxAmount: RubicBridgeProviderService.RubicMaxAmount
          }
        } as BlockchainsTokens,

        fromEthFee: response.tokens[1].fee,
        toEthFee: response.tokens[0].fee
      }))
    );
  }

  public getFee(token: BridgeToken, toBlockchain: BLOCKCHAIN_NAME): Observable<number> {
    if (toBlockchain === BLOCKCHAIN_NAME.ETHEREUM) {
      return of(token.toEthFee);
    }
    return of(token.fromEthFee);
  }

  public checkIfEthereumGasPriceIsHigh(): Observable<boolean> {
    return this.httpClient
      .get(`${this.apiUrl}gas/Ethereum/`)
      .pipe(map((res: { status: string }) => res.status === 'HIGH'));
  }

  public createTrade(bridgeTrade: BridgeTrade): Observable<string> {
    return new Observable(subscriber => {
      this.createRubicTrade(bridgeTrade)
        .then(async transactionHash => {
          this.bridgeApiService.notifyBridgeBot(
            bridgeTrade,
            transactionHash,
            this.web3PrivateService.address
          );
          subscriber.next(transactionHash);
        })
        .catch(err => {
          subscriber.error(err);
        })
        .finally(() => {
          subscriber.complete();
        });
    });
  }

  private async createRubicTrade(bridgeTrade: BridgeTrade): Promise<string> {
    const { token } = bridgeTrade;

    if (token.symbol !== 'RBC') {
      throw new Error('Rubic bridge supports only rubic token.');
    }

    const web3Public: Web3Public = this.web3PublicService[bridgeTrade.fromBlockchain];
    const trade: RubicTrade = {
      token: {
        address: token.blockchainToken[bridgeTrade.fromBlockchain].address,
        decimals: token.blockchainToken[bridgeTrade.fromBlockchain].decimals
      }
    } as RubicTrade;

    if (bridgeTrade.fromBlockchain === BLOCKCHAIN_NAME.ETHEREUM) {
      trade.token.symbol = 'RBC';
      trade.swapContractAddress = this.EthereumSmartContractAddress;
      trade.swapContractAbi = EthereumContractAbi;
    } else {
      trade.token.symbol = 'BRBC';
      trade.swapContractAddress = this.BinanceSmartContractAddress;
      trade.swapContractAbi = BinanceContractAbi;
    }

    trade.amount = bridgeTrade.amount.multipliedBy(10 ** trade.token.decimals);

    const balance = await web3Public.getTokenBalance(
      this.web3PrivateService.address,
      trade.token.address
    );
    if (balance.lt(trade.amount)) {
      const formattedTokensBalance = balance.div(10 ** trade.token.decimals).toString();
      throw new InsufficientFundsError(
        trade.token.symbol,
        formattedTokensBalance,
        bridgeTrade.amount.toString()
      );
    }

    const onApprove = bridgeTrade.onTransactionHash;
    await this.provideAllowance(trade, web3Public, onApprove);

    const blockchain = bridgeTrade.fromBlockchain === BLOCKCHAIN_NAME.ETHEREUM ? 1 : 2;

    const onTradeTransactionHash = async hash => {
      if (bridgeTrade.onTransactionHash) {
        bridgeTrade.onTransactionHash(hash);
      }
      await this.bridgeApiService.postRubicTransaction(
        bridgeTrade.fromBlockchain,
        hash,
        trade.amount.toFixed(),
        this.web3PrivateService.address
      );
    };

    const receipt = await this.web3PrivateService.executeContractMethod(
      trade.swapContractAddress,
      trade.swapContractAbi,
      'transferToOtherBlockchain',
      [blockchain, trade.amount.toFixed(0), bridgeTrade.toAddress],
      {
        onTransactionHash: onTradeTransactionHash
      }
    );

    return receipt.transactionHash;
  }

  private async provideAllowance(trade: RubicTrade, web3Public: Web3Public, onApprove) {
    const allowance = await web3Public.getAllowance(
      trade.token.address,
      this.web3PrivateService.address,
      trade.swapContractAddress
    );
    if (trade.amount.gt(allowance)) {
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      const uintInfinity = new BigNumber(2).pow(256).minus(1);
      await this.web3PrivateService.approveTokens(
        trade.token.address,
        trade.swapContractAddress,
        uintInfinity,
        {
          onTransactionHash: onApprove
        }
      );
    }
  }
}
