import { Component, OnInit } from '@angular/core';
import {BridgeService} from '../../services/bridge/bridge.service';
import {HttpClient} from '@angular/common/http';
import {List} from 'immutable';
import {IBridgeToken, BridgeNetwork} from '../../services/bridge/types';


@Component({
  selector: 'app-bridge-form',
  templateUrl: './bridge-form.component.html',
  styleUrls: ['./bridge-form.component.scss'],
  providers: [BridgeService, HttpClient]
})
export class BridgeFormComponent implements OnInit {

  public Blockchains = {
    Ethereum : {
      name : BridgeNetwork.ETHEREUM,
      label: "Ethereum",
      img: "eth.png"
    },
    Binance: {
      name : BridgeNetwork.BINANCE_SMART_CHAIN,
      label: "Binance Smart Chain",
      img: "bnb.svg"
    }
  }

  public fromBlockchain = this.Blockchains.Ethereum;
  public toBlockchain = this.Blockchains.Binance;
  public tokens: List<IBridgeToken> = List([]);
  public selectedToken: IBridgeToken = null;
  public _fromNumber: number;
  private _fee: number;
  public toNumber: number;
  public feeCalculationProgress: boolean = false;

  set fromNumber(fromNumber: number) {
    this._fromNumber = fromNumber;
    this.setToNumber();
  }

  get fromNumber(): number {
    return this._fromNumber;
  }

  set fee(fee) {
    this._fee = fee;
    this.setToNumber();
  }

  get fee(): number {
    return this._fee;
  }

  private setToNumber(): void {
    if (this.fromNumber != undefined && this.fee != undefined) {
      this.toNumber = this.fromNumber - this.fee;
    } else {
      this.toNumber = undefined;
    }
  }

  constructor(private bridgeService: BridgeService) {
    bridgeService.tokens.subscribe(tokens => this.tokens = tokens);
  }

  ngOnInit() { }

  public revertBlockchains() {
    [this.fromBlockchain, this.toBlockchain] = [this.toBlockchain, this.fromBlockchain];
    this.onSelectedTokenChanges(this.selectedToken);
  }

  public onSelectedTokenChanges(token) {
    this.fee = undefined;
    this.feeCalculationProgress = true;
    this.selectedToken = token;
    this.bridgeService.getFee(this.selectedToken.symbol, this.toBlockchain.name)
      .subscribe(
          fee => this.fee = fee
      , err => alert(err)
      , () =>  this.feeCalculationProgress = false)
  }

  public onTokensNumberChanges(tokensNumber: number | string) {
    if (tokensNumber) {
      this.fromNumber = Number(tokensNumber);
    }
  }
}
