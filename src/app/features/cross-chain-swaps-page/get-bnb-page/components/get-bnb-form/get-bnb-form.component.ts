import { Component, OnDestroy, OnInit } from '@angular/core';
import { List } from 'immutable';
import { Subscription } from 'rxjs';
import { TokensService } from '../../../../../core/services/backend/tokens-service/tokens.service';
import SwapToken from '../../../../../shared/models/tokens/SwapToken';
import { BLOCKCHAIN_NAME } from '../../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import { NATIVE_TOKEN_ADDRESS } from '../../../../../shared/constants/blockchain/NATIVE_TOKEN_ADDRESS';

@Component({
  selector: 'app-get-bnb-form',
  templateUrl: './get-bnb-form.component.html',
  styleUrls: ['./get-bnb-form.component.scss']
})
export class GetBnbFormComponent implements OnInit, OnDestroy {
  private readonly RBC_ADDRESS = '0xa4eed63db85311e22df4473f87ccfc3dadcfa3e3';

  public fromTokensList: List<SwapToken>;

  private _tokensSubscription$: Subscription;

  constructor(private tokensService: TokensService) {}

  ngOnInit() {
    this._tokensSubscription$ = this.tokensService.tokens.subscribe(tokens => {
      this.fromTokensList = tokens.filter(
        token =>
          token.blockchain === BLOCKCHAIN_NAME.ETHEREUM &&
          (token.address === NATIVE_TOKEN_ADDRESS || token.address === this.RBC_ADDRESS)
      );
    });
  }

  ngOnDestroy() {
    this._tokensSubscription$.unsubscribe();
  }
}
