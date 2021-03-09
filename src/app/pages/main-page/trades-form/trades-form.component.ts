import { Component, OnInit, Type } from '@angular/core';
import { InstantTradesComponent } from '../instant-trades/instant-trades.component';

import { OrderBookComponent } from '../order-book/order-book.component';
import { MODE_NAMES } from './types';
import { BLOCKCHAIN_NAME } from '../../../services/blockchain/types/Blockchain';

interface Blockchain {
  name: BLOCKCHAIN_NAME;
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
    BLOCKCHAIN_NAME
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
      name: BLOCKCHAIN_NAME.ETHEREUM,
      code: 22,
      label: 'Ethereum',
      image: 'assets/images/icons/coins/eth.png'
    },
    {
      name: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
      code: 22,
      label: 'Binance Smart Chain',
      image: 'assets/images/icons/coins/bnb.svg'
    },
    {
      name: BLOCKCHAIN_NAME.MATIC,
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
      component(blockchain: BLOCKCHAIN_NAME) {
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
      component(blockchain: BLOCKCHAIN_NAME) {
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

  private _selectedBlockchain = BLOCKCHAIN_NAME.ETHEREUM;

  private _selectedMode: MODE_NAMES = MODE_NAMES.INSTANT_TRADE;

  set selectedMode(mode: MODE_NAMES) {
    this._selectedMode = mode;
  }

  get selectedMode(): MODE_NAMES {
    return this._selectedMode;
  }

  set selectedBlockchain(blockchain: BLOCKCHAIN_NAME) {
    this._selectedBlockchain = blockchain;
  }

  get selectedBlockchain(): BLOCKCHAIN_NAME {
    return this._selectedBlockchain;
  }

  constructor() {}

  ngOnInit() {}

  public selectBlockchain(blockchainName: BLOCKCHAIN_NAME) {
    this.selectedBlockchain = blockchainName;
  }

  public selectMode(mode: MODE_NAMES) {
    this.selectedMode = mode;
  }
}
