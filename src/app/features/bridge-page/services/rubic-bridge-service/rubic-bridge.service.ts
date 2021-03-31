import { Injectable } from '@angular/core';
import BigNumber from 'bignumber.js';
import { BridgeToken } from '../../models/BridgeToken';
import { BLOCKCHAIN_NAME } from '../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import { Web3PrivateService } from '../../../../core/services/blockchain/web3-private-service/web3-private.service';
import { Web3PublicService } from '../../../../core/services/blockchain/web3-public-service/web3-public.service';
import { Web3Public } from '../../../../core/services/blockchain/web3-public-service/Web3Public';
import BinanceContractAbi from './abi/BinanceContractAbi';
import EthereumContractAbi from './abi/EthereumContractAbi';
import { UseTestingModeService } from '../../../../core/services/use-testing-mode/use-testing-mode.service';

interface BridgeTrade {
  token: {
    address: string;
    decimals: number;
  };
  amount: BigNumber;
  swapContractAddress: string;
  swapContractAbi: any[];
}

@Injectable()
export class RubicBridgeService {
  private EthereumSmartContractAddress = '0x8E3BCC334657560253B83f08331d85267316e08a';

  private BinanceSmartContractAddress = '0xE77b0E832A58aFc2fcDaed060E8D701d97533086';

  constructor(
    private web3Private: Web3PrivateService,
    private web3PublicService: Web3PublicService,
    useTestingMode: UseTestingModeService
  ) {
    useTestingMode.isTestingMode.subscribe(value => {
      if (value) {
        this.EthereumSmartContractAddress = '0xd806e441b27f4f827710469b0acb4e045e62b676';
        this.BinanceSmartContractAddress = '0x17caca02ddf472f62bfed5165facf7a6b5c72926';
      }
    });
  }

  public async createTrade(
    token: BridgeToken,
    fromNetwork: BLOCKCHAIN_NAME,
    amount: BigNumber,
    toAddress: string,
    onApprove?: (hash: string) => void,
    onTransactionHash?: (hash: string) => void
  ): Promise<string> {
    if (token.symbol !== 'RBC') {
      throw new Error('Rubic bridge supports only rubic token.');
    }

    const web3Public = this.web3PublicService[fromNetwork];
    const trade: BridgeTrade = { token: {} } as BridgeTrade;

    if (fromNetwork === BLOCKCHAIN_NAME.ETHEREUM) {
      trade.token.address = token.ethContractAddress;
      trade.token.decimals = Number(token.ethContractDecimal);
      trade.swapContractAddress = this.EthereumSmartContractAddress;
      trade.swapContractAbi = EthereumContractAbi;
    } else {
      trade.token.address = token.bscContractAddress;
      trade.token.decimals = Number(token.bscContractDecimal);
      trade.swapContractAddress = this.BinanceSmartContractAddress;
      trade.swapContractAbi = BinanceContractAbi;
    }

    trade.amount = amount.multipliedBy(10 ** trade.token.decimals);

    await this.provideAllowance(trade, web3Public, onApprove);

    const blockchain = fromNetwork === BLOCKCHAIN_NAME.ETHEREUM ? 1 : 2;

    const receipt = await this.web3Private.executeContractMethod(
      trade.swapContractAddress,
      trade.swapContractAbi,
      'transferToOtherBlockchain',
      [blockchain, trade.amount.toFixed(0), toAddress],
      { onTransactionHash }
    );

    return receipt.transactionHash;
  }

  private async provideAllowance(trade: BridgeTrade, web3Public: Web3Public, onApprove) {
    const allowance = await web3Public.getAllowance(
      trade.token.address,
      this.web3Private.address,
      trade.swapContractAddress
    );
    if (trade.amount.gt(allowance)) {
      const uintInfinity = new BigNumber(2).pow(256).minus(1);
      await this.web3Private.approveTokens(
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
