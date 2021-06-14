import { Component, OnInit } from '@angular/core';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { NATIVE_TOKEN_ADDRESS } from 'src/app/shared/constants/blockchain/NATIVE_TOKEN_ADDRESS';
import { BlockchainToken } from 'src/app/shared/models/tokens/BlockchainToken';
import { BLOCKCHAINS } from 'src/app/shared/constants/blockchain/BLOCKCHAINS';

interface TableToken extends BlockchainToken {
  image: string;
  amount: number;
}

interface TableTrade {
  status: string;
  fromToken: TableToken;
  toToken: TableToken;
  date: Date;
}

interface TradeTableRow {
  Status: string;
  From: string;
  To: string;
  Sent: number;
  Expected: number;
  Date: Date;
}

@Component({
  selector: 'app-my-trades',
  templateUrl: './my-trades.component.html',
  styleUrls: ['./my-trades.component.scss']
})
export class MyTradesComponent implements OnInit {
  public BLOCKCHAINS = BLOCKCHAINS;

  private ethToken: TableToken = {
    blockchain: BLOCKCHAIN_NAME.ETHEREUM,
    address: NATIVE_TOKEN_ADDRESS,
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
    image: 'http://dev-api.rubic.exchange/media/token_images/cg_logo_ETH_ethereum_4jp3DKD.png',
    amount: 50
  };

  private bscToken: TableToken = {
    blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    address: NATIVE_TOKEN_ADDRESS,
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
    image: 'http://dev-api.rubic.exchange/media/token_images/cg_logo_ETH_ethereum_4jp3DKD.png',
    amount: 50
  };

  public readonly tableTrades: TableTrade[] = [
    {
      status: 'Waiting for deposit',
      fromToken: this.ethToken,
      toToken: this.bscToken,
      date: new Date(Date.now())
    },
    {
      status: 'Completed',
      fromToken: this.ethToken,
      toToken: this.bscToken,
      date: new Date(Date.now())
    },
    {
      status: 'Cancelled',
      fromToken: this.ethToken,
      toToken: this.bscToken,
      date: new Date(Date.now())
    }
  ];

  public columns: string[];

  public data: TradeTableRow[] = [];

  constructor() {}

  ngOnInit(): void {
    this.tableTrades.forEach(trade => {
      this.data.push({
        Status: trade.status,
        From: trade.fromToken.blockchain,
        To: trade.toToken.blockchain,
        Sent: trade.fromToken.amount,
        Expected: trade.toToken.amount,
        Date: trade.date
      });
    });
    this.columns = Object.keys(this.data[0]);
  }
}
