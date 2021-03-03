import { Component, OnInit, Type } from '@angular/core';
import { InstantTradesComponent } from '../instant-trades/instant-trades.component';

import { OrderBookComponent } from '../order-book/order-book.component';
import { BLOCKCHAIN_NAMES, MODE_NAMES } from './types';

interface Blockchain {
  name: BLOCKCHAIN_NAMES;
  code: number;
  label: string;
  image: string;
}

interface Mode {
  name: MODE_NAMES;
  label: string;
  imageActive: string;
  imageNotActive: string;
  component(
    BLOCKCHAIN_NAMES
  ): {
    html: Type<any>;
    inputs?: any;
  };
}

@Component({
  selector: 'app-trades-form',
  templateUrl: './trades-form.component.html',
  styleUrls: ['./trades-form.component.scss']
})
export class TradesFormComponent implements OnInit {
  public BLOCKCHAINS: Array<Blockchain> = [
    {
      name: BLOCKCHAIN_NAMES.ETHEREUM,
      code: 22,
      label: 'Ethereum',
      image: 'assets/images/icons/coins/eth.png'
    },
    {
      name: BLOCKCHAIN_NAMES.BINANCE_SMART_CHAIN,
      code: 22,
      label: 'Binance Smart Chain',
      image: 'assets/images/icons/coins/bnb.svg'
    },
    {
      name: BLOCKCHAIN_NAMES.MATIC,
      code: 22,
      label: 'Matic',
      image: 'assets/images/icons/coins/matic.svg'
    }
  ];

  public MODES: Array<Mode> = [
    {
      name: MODE_NAMES.INSTANT_TRADE,
      label: 'Instant trade',
      imageActive: 'assets/images/icons/main-page/InstantTrade.svg',
      imageNotActive: 'assets/images/icons/main-page/InstantTrade_deactive.svg',
      component(blockchain: BLOCKCHAIN_NAMES) {
        return {
          html: InstantTradesComponent,
          inputs: {
            blockchain
          }
        };
      }
    },
    {
      name: MODE_NAMES.ORDER_BOOK,
      label: 'Order book',
      imageActive: 'assets/images/icons/main-page/OrderBook.svg',
      imageNotActive: 'assets/images/icons/main-page/OrderBook_deactive.svg',
      component(blockchain: BLOCKCHAIN_NAMES) {
        return {
          html: OrderBookComponent,
          inputs: {
            blockchain
          }
        };
      }
    }
  ];

  public MODE_NAMES = MODE_NAMES;

  private _selectedBlockchain = BLOCKCHAIN_NAMES.ETHEREUM;
  private _selectedMode: MODE_NAMES = MODE_NAMES.INSTANT_TRADE;

  set selectedMode(mode: MODE_NAMES) {
    this._selectedMode = mode;
  }

  get selectedMode(): MODE_NAMES {
    return this._selectedMode;
  }

  set selectedBlockchain(blockchain: BLOCKCHAIN_NAMES) {
    this._selectedBlockchain = blockchain;
  }

  get selectedBlockchain(): BLOCKCHAIN_NAMES {
    return this._selectedBlockchain;
  }

  constructor() {}

  ngOnInit() {}

  public selectBlockchain(blockchainName: BLOCKCHAIN_NAMES) {
    this.selectedBlockchain = blockchainName;
  }

  public selectMode(mode: MODE_NAMES) {
    this.selectedMode = mode;
  }
}
