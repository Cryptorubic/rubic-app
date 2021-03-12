import { Component, OnDestroy, OnInit, Type } from '@angular/core';
import { Subscription } from 'rxjs';
import { InstantTradesComponent } from './components/instant-trades/instant-trades.component';

import { OrderBookComponent } from './components/order-book/order-book.component';
import { TRADE_MODE } from '../../models';
import { BLOCKCHAIN_NAME } from '../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import { TradeTypeService } from '../../services/trade-type-service/trade-type.service';

interface Blockchain {
  name: BLOCKCHAIN_NAME;
  code: number;
  label: string;
  image: string;
}

interface Mode {
  name: TRADE_MODE;
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
export class TradesFormComponent implements OnInit, OnDestroy {
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
      name: TRADE_MODE.INSTANT_TRADE,
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
      name: TRADE_MODE.ORDER_BOOK,
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

  public TRADE_MODE = TRADE_MODE;

  private _modeSubscription$: Subscription;

  private _blockchainSubscription$: Subscription;

  private _selectedBlockchain = BLOCKCHAIN_NAME.ETHEREUM;

  private _selectedMode: TRADE_MODE = TRADE_MODE.INSTANT_TRADE;

  set selectedMode(mode: TRADE_MODE) {
    this._selectedMode = mode;
    this.tradeTypeService.setMode(mode);
  }

  get selectedMode(): TRADE_MODE {
    return this._selectedMode;
  }

  set selectedBlockchain(blockchain: BLOCKCHAIN_NAME) {
    this._selectedBlockchain = blockchain;
    this.tradeTypeService.setBlockchain(blockchain);
  }

  get selectedBlockchain(): BLOCKCHAIN_NAME {
    return this._selectedBlockchain;
  }

  constructor(private tradeTypeService: TradeTypeService) {}

  ngOnInit() {
    this._modeSubscription$ = this.tradeTypeService.getMode().subscribe(mode => {
      this.selectedMode = mode;
    });
    this._blockchainSubscription$ = this.tradeTypeService.getBlockchain().subscribe(blockchain => {
      this.selectedBlockchain = blockchain;
    });
  }

  ngOnDestroy() {
    this._modeSubscription$.unsubscribe();
    this._blockchainSubscription$.unsubscribe();
  }

  public selectBlockchain(blockchainName: BLOCKCHAIN_NAME) {
    this.selectedBlockchain = blockchainName;
  }

  public selectMode(mode: TRADE_MODE) {
    this.selectedMode = mode;
  }
}
