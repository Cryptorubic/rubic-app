import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import {
  Blockchain,
  BLOCKCHAINS
} from 'src/app/features/swaps-page/instant-trades/models/BLOCKCHAINS';
import { AsyncPipe } from '@angular/common';
import { BLOCKCHAIN_NAME } from '../../../../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import { TradeTypeService } from '../../../../../../../core/services/swaps/trade-type-service/trade-type.service';
import { QueryParamsService } from '../../../../../../../core/services/query-params/query-params.service';

@Component({
  selector: 'app-chain-dropdown',
  templateUrl: './chain-dropdown.component.html',
  styleUrls: ['./chain-dropdown.component.scss']
})
export class ChainDropdownComponent {
  public selectedBlockchain: Blockchain;

  @Input() public disabled: boolean;

  @Output() public blockchainChanges = new EventEmitter<Blockchain>();

  public readonly BLOCKCHAINS;

  constructor(
    private readonly tradeTypeService: TradeTypeService,
    private readonly queryParamsService: QueryParamsService,
    private readonly cdr: ChangeDetectorRef
  ) {
    const hiddenBlockchains = new AsyncPipe(this.cdr).transform(
      this.queryParamsService.$hiddenNetworks
    );
    this.BLOCKCHAINS = BLOCKCHAINS.filter((blockchain: Blockchain) => {
      return !hiddenBlockchains.includes(blockchain.name);
    });
    this.tradeTypeService.getBlockchain().subscribe((blockchainName: BLOCKCHAIN_NAME) => {
      this.selectedBlockchain = BLOCKCHAINS.find(
        (blockchain: Blockchain) => blockchain.name === blockchainName
      );
    });
  }

  public onBlockchainChanges(blockchain: Blockchain) {
    this.selectedBlockchain = blockchain;
    this.tradeTypeService.setBlockchain(blockchain.name);
  }
}
