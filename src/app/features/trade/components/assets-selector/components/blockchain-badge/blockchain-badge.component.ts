import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BlockchainName } from 'rubic-sdk';
import { BlockchainTags } from '../blockchains-filter-list/models/BlockchainFilters';
import { blockchainsPromoLinks } from './constants/blockchains-promo-links';

@Component({
  selector: 'app-blockchain-badge',
  templateUrl: './blockchain-badge.component.html',
  styleUrls: ['./blockchain-badge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlockchainBadgeComponent {
  @Input({ required: true }) tag!: string;

  @Input({ required: true }) blockchain: BlockchainName;

  public readonly blockchainTags = BlockchainTags;

  public readonly blockchainPromoLinks = blockchainsPromoLinks;
}
