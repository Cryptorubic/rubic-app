import { Component, OnDestroy, OnInit } from '@angular/core';
import { List } from 'immutable';
import { Subscription } from 'rxjs';
import { Web3PrivateService } from 'src/app/core/services/blockchain/web3-private-service/web3-private.service';
import { BLOCKCHAINS } from 'src/app/features/cross-chain-swaps-page/common/constants/BLOCKCHAINS';
import { TokensService } from 'src/app/core/services/backend/tokens-service/tokens.service';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { NATIVE_TOKEN_ADDRESS } from 'src/app/shared/constants/blockchain/NATIVE_TOKEN_ADDRESS';
import SwapToken from 'src/app/shared/models/tokens/SwapToken';

@Component({
  selector: 'app-get-bnb-form',
  templateUrl: './get-bnb-form.component.html',
  styleUrls: ['./get-bnb-form.component.scss']
})
export class GetBnbFormComponent implements OnInit, OnDestroy {
  private readonly RBC_ADDRESS = '0xa4eed63db85311e22df4473f87ccfc3dadcfa3e3';

  public BLOCKCHAIN_NAME = BLOCKCHAIN_NAME;

  public blockchainsList = Object.values(BLOCKCHAINS);

  public fromBlockchain = BLOCKCHAINS[BLOCKCHAIN_NAME.ETHEREUM];

  public toBlockchain = BLOCKCHAINS[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN];

  public fromTokensList: List<SwapToken>;

  private _tokensSubscription$: Subscription;

  public walletAddress: string;

  private _walletAddressSubscription$: Subscription;

  constructor(
    private tokensService: TokensService,
    private web3PrivateService: Web3PrivateService
  ) {}

  ngOnInit() {
    this._tokensSubscription$ = this.tokensService.tokens.subscribe(tokens => {
      this.fromTokensList = tokens.filter(
        token =>
          token.blockchain === BLOCKCHAIN_NAME.ETHEREUM &&
          (token.address === NATIVE_TOKEN_ADDRESS || token.address === this.RBC_ADDRESS)
      );
    });

    this._walletAddressSubscription$ = this.web3PrivateService.onAddressChanges.subscribe(
      address => {
        this.walletAddress = address;
      }
    );
  }

  ngOnDestroy() {
    this._tokensSubscription$.unsubscribe();
    this._walletAddressSubscription$.unsubscribe();
  }
}
