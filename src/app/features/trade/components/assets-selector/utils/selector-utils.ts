import { AvailableBlockchain } from '@features/trade/components/assets-selector/services/blockchains-list-service/models/available-blockchain';
import { BlockchainTags } from '@features/trade/components/assets-selector/components/blockchains-filter-list/models/BlockchainFilters';

export class SelectorUtils {
  public static getBlockchainTag(blockchain: AvailableBlockchain): string {
    const tags = blockchain.tags
      .filter(
        tag =>
          tag === BlockchainTags.PROMO ||
          tag === BlockchainTags.NEW ||
          tag === BlockchainTags.BDAY_PROMO
      )
      .sort((a, b) => {
        if (a === BlockchainTags.BDAY_PROMO || a === BlockchainTags.PROMO) return -1;
        if (b === BlockchainTags.BDAY_PROMO) return 1;
        return 0;
      });

    return tags[0];
  }
}
