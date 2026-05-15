import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BlockchainName } from '@cryptorubic/core';
import { BlockchainTags } from '../blockchains-filter-list/models/BlockchainFilters';
import { blockchainsPromoLinks } from './constants/blockchains-promo-links';

@Component({
  selector: 'app-blockchains-promo-badge',
  templateUrl: './blockchains-promo-badge.component.html',
  styleUrls: ['./blockchains-promo-badge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlockchainsPromoBadgeComponent {
  @Input({ required: true }) tag!: string;

  @Input({ required: true }) blockchain: BlockchainName;

  public readonly blockchainTags = BlockchainTags;

  public readonly blockchainPromoLinks = blockchainsPromoLinks;
}
