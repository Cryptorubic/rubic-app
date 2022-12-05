import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BlockchainsListService } from '@features/swaps/shared/components/tokens-selector/services/blockchains-list-service/blockchains-list.service';
import { AvailableBlockchain } from '@features/swaps/shared/components/tokens-selector/services/blockchains-list-service/models/available-blockchain';
import { TokensSelectorService } from '@features/swaps/shared/components/tokens-selector/services/tokens-selector-service/tokens-selector.service';
import { BlockchainName } from 'rubic-sdk';

@Component({
  selector: 'app-blockchains-list',
  templateUrl: './blockchains-list.component.html',
  styleUrls: ['./blockchains-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlockchainsListComponent {
  public readonly blockchainsList = this.blockchainsListService.availableBlockchains;

  constructor(
    private readonly blockchainsListService: BlockchainsListService,
    private readonly tokensSelectorService: TokensSelectorService
  ) {}

  public isDisabled(blockchain: AvailableBlockchain): boolean {
    return this.blockchainsListService.isDisabled(blockchain);
  }

  public getHintText(blockchain: AvailableBlockchain): string | null {
    return this.blockchainsListService.getHintText(blockchain);
  }

  public onSelectorSwitch(): void {
    this.tokensSelectorService.switchSelectorType();
  }

  public onBlockchainSelect(blockchainName: BlockchainName): void {
    this.tokensSelectorService.blockchain = blockchainName;
    this.tokensSelectorService.switchSelectorType();
  }
}
