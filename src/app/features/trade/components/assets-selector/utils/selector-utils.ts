import { AvailableBlockchain } from '@features/trade/components/assets-selector/services/blockchains-list-service/models/available-blockchain';
import { BLOCKCHAIN_TAG } from '../models/blockchain-tag';

export class SelectorUtils {
  public static getBlockchainTag(blockchain: AvailableBlockchain): string {
    const tags = blockchain.tags
      .filter(
        tag =>
          tag === BLOCKCHAIN_TAG.PROMO ||
          tag === BLOCKCHAIN_TAG.NEW ||
          tag === BLOCKCHAIN_TAG.BDAY_PROMO
      )
      .sort((a, b) => {
        if (a === BLOCKCHAIN_TAG.BDAY_PROMO || a === BLOCKCHAIN_TAG.PROMO) return -1;
        if (b === BLOCKCHAIN_TAG.BDAY_PROMO) return 1;
        return 0;
      });

    return tags[0];
  }
}
