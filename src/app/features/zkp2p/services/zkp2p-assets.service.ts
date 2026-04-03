import { Injectable } from '@angular/core';
import {
  blockchainsList,
  RankedBlockchain
} from '@app/features/trade/components/assets-selector/services/blockchains-list-service/constants/blockchains-list';
import { disabledFromBlockchains } from '@app/features/trade/components/assets-selector/services/blockchains-list-service/constants/disabled-from-blockchains';
import { AvailableBlockchain } from '@app/features/trade/components/assets-selector/services/blockchains-list-service/models/available-blockchain';
import { AssetsService } from '@app/features/trade/components/assets-selector/services/blockchains-list-service/utils/assets.service';
import { blockchainIcon } from '@app/shared/constants/blockchain/blockchain-icon';
import { blockchainLabel } from '@app/shared/constants/blockchain/blockchain-label';
import { BlockchainName } from '@cryptorubic/core';
import { ZKP2P_SUPPORTED_CHAINS } from '../constants/supported-chains';

@Injectable()
export class Zkp2pAssetsService extends AssetsService {
  protected supportedBlockchains: Readonly<BlockchainName[]> = ZKP2P_SUPPORTED_CHAINS;

  constructor() {
    super('from');
    this.postConstructorInit();
  }

  public isDisabledFrom(blockchain: AvailableBlockchain): boolean {
    return blockchain.disabledFrom;
  }

  public setBlockchainList(chains: BlockchainName[]): void {
    this.supportedBlockchains = chains;
    this.setAvailableBlockchains();
    this.blockchainsToShow = this._availableBlockchains;
  }

  protected setAvailableBlockchains(): void {
    let blockchains: readonly RankedBlockchain[] = blockchainsList;
    if (this.queryParamsService.enabledBlockchains) {
      blockchains = blockchains.filter(blockchain =>
        this.queryParamsService.enabledBlockchains.includes(blockchain.name)
      );
    }
    blockchains = blockchains.filter(blockchain =>
      this.supportedBlockchains.includes(blockchain.name)
    );

    const availableBlockchains = blockchains.map(blockchain => {
      const disabledConfiguration = !this.platformConfigurationService.isAvailableBlockchain(
        blockchain.name
      );
      const disabledFrom = disabledFromBlockchains.includes(blockchain.name);

      return {
        name: blockchain.name,
        rank: blockchain.rank,
        icon: blockchainIcon[blockchain.name],
        label: blockchainLabel[blockchain.name],
        tags: blockchain.tags,
        disabledConfiguration,
        disabledFrom
      };
    });
    const sortedAvailableBlockchains = availableBlockchains.sort((a, b) => b.rank - a.rank);
    this._availableBlockchains = sortedAvailableBlockchains;
  }
}
