import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BlockchainName } from '@cryptorubic/core';
import { blockchainsPromoLinks } from './constants/blockchains-promo-links';
import { BLOCKCHAIN_TAG } from '../../models/blockchain-tag';

@Component({
  standalone: false,
  selector: 'app-blockchains-promo-badge',
  templateUrl: './blockchains-promo-badge.component.html',
  styleUrls: ['./blockchains-promo-badge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlockchainsPromoBadgeComponent {
  @Input({ required: true }) tag!: string;

  @Input({ required: true }) blockchain: BlockchainName;

  public readonly BLOCKCHAIN_TAG = BLOCKCHAIN_TAG;

  public readonly blockchainPromoLinks = blockchainsPromoLinks;
}
