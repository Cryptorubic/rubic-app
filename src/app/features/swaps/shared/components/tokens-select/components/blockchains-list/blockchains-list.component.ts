import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BlockchainsListService } from '@features/swaps/shared/components/tokens-select/services/blockchains-list-service/blockchains-list.service';
import { AvailableBlockchain } from '@features/swaps/shared/components/tokens-select/services/blockchains-list-service/models/available-blockchain';

@Component({
  selector: 'app-blockchains-list',
  templateUrl: './blockchains-list.component.html',
  styleUrls: ['./blockchains-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlockchainsListComponent {
  public readonly blockchainsList = this.blockchainsListService.availableBlockchains;

  constructor(private readonly blockchainsListService: BlockchainsListService) {}

  public isDisabled(blockchain: AvailableBlockchain): boolean {
    return this.blockchainsListService.isDisabled(blockchain);
  }

  public getHintText(blockchain: AvailableBlockchain): string | null {
    return this.blockchainsListService.getHintText(blockchain);
  }
}
