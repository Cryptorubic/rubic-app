import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { QueryParamsService } from 'src/app/core/services/query-params/query-params.service';
import { TRADE_MODE } from '../../models';
import { BLOCKCHAIN_NAME } from '../../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import { TradeTypeService } from '../../../../../core/services/swaps/trade-type-service/trade-type.service';
import { BLOCKCHAINS } from '../../../../../shared/models/blockchain/BLOCKCHAINS';

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
  public readonly BLOCKCHAINS = BLOCKCHAINS;

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

  public readonly $hiddenNetworks: Observable<string[]>;

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

  constructor(
    private tradeTypeService: TradeTypeService,
    private readonly queryParamsService: QueryParamsService
  ) {
    this.$hiddenNetworks = this.queryParamsService.$hiddenNetworks;
  }

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
}
