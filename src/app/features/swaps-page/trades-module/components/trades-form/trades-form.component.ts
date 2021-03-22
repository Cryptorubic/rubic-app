import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TRADE_MODE } from '../../models';
import { BLOCKCHAIN_NAME } from '../../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import { TradeTypeService } from '../../../../../core/services/swaps/trade-type-service/trade-type.service';

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
      imageNotActive: 'assets/images/icons/main-page/InstantTrade_deactive.svg'
    },
    {
      name: TRADE_MODE.ORDER_BOOK,
      label: 'Order book',
      imageActive: 'assets/images/icons/main-page/OrderBook.svg',
      imageNotActive: 'assets/images/icons/main-page/OrderBook_deactive.svg'
    }
  ];

  public TRADE_MODE = TRADE_MODE;

  public BLOCKCHAIN_NAME = BLOCKCHAIN_NAME;

  private _modeSubscription$: Subscription;

  private _blockchainSubscription$: Subscription;

  private _selectedBlockchain: BLOCKCHAIN_NAME;

  private _selectedMode: TRADE_MODE;

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
      this._selectedMode = mode;
    });
    this._blockchainSubscription$ = this.tradeTypeService.getBlockchain().subscribe(blockchain => {
      this._selectedBlockchain = blockchain;
    });
  }

  ngOnDestroy() {
    this._modeSubscription$.unsubscribe();
    this._blockchainSubscription$.unsubscribe();
  }

  public selectBlockchain(blockchain: BLOCKCHAIN_NAME) {
    if (blockchain === BLOCKCHAIN_NAME.MATIC && this.selectedMode === TRADE_MODE.INSTANT_TRADE) {
      this.selectedMode = TRADE_MODE.ORDER_BOOK;
    }
    this.selectedBlockchain = blockchain;
  }

  public selectMode(mode: TRADE_MODE) {
    if (this.selectedBlockchain === BLOCKCHAIN_NAME.MATIC && mode === TRADE_MODE.INSTANT_TRADE) {
      this.selectedBlockchain = BLOCKCHAIN_NAME.ETHEREUM;
    }
    this.selectedMode = mode;
  }
}
