import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TRADE_MODE } from '../../../trades-module/models';
import { TradeTypeService } from '../../../../../core/services/swaps/trade-type-service/trade-type.service';

@Component({
  selector: 'app-swaps-page',
  templateUrl: './swaps-page.component.html',
  styleUrls: ['./swaps-page.component.scss']
})
export class SwapsPageComponent implements OnInit, OnDestroy {
  private _selectedMode: TRADE_MODE;

  private _modeSubscription$: Subscription;

  public TRADE_MODE = TRADE_MODE;

  get selectedMode(): TRADE_MODE {
    return this._selectedMode;
  }

  set selectedMode(value) {
    this._selectedMode = value;
    this.tradeTypeService.setMode(value);
  }

  constructor(private tradeTypeService: TradeTypeService) {}

  ngOnInit() {
    this._modeSubscription$ = this.tradeTypeService.getMode().subscribe(mode => {
      this._selectedMode = mode;
    });
  }

  ngOnDestroy() {
    this._modeSubscription$.unsubscribe();
  }
}
