import { Component, OnInit } from '@angular/core';
import {BridgeService} from '../../services/bridge/bridge.service';
import {HttpClient} from '@angular/common/http';
import {List} from 'immutable';
import IBridgeToken from '../../services/bridge/IBridgeToken';


@Component({
  selector: 'app-bridge-form',
  templateUrl: './bridge-form.component.html',
  styleUrls: ['./bridge-form.component.scss'],
  providers: [BridgeService, HttpClient]
})
export class BridgeFormComponent implements OnInit {
  public tokens: List<IBridgeToken> = List([]);

  public Blockchains = {
    Ethereum : {
      name : "Ethereum",
      label: "Ethereum",
      img: "eth.png"
    },
    Binance: {
      name : "Binance",
      label: "Binance",
      img: "bnb.svg"
    }
  }

  public fromBlockchain = this.Blockchains.Ethereum;
  public toBlockchain = this.Blockchains.Binance;

  constructor(private bridgeService: BridgeService) {
    bridgeService.tokens.subscribe(tokens => this.tokens = tokens);
  }

  ngOnInit() {

  }

  public revertBlockchains() {
    [this.fromBlockchain, this.toBlockchain] = [this.toBlockchain, this.fromBlockchain];
  }

}
