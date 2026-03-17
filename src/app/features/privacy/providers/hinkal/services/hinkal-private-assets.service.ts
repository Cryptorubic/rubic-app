import { inject, Injectable } from '@angular/core';
import { PrivateAssetsService } from '../../shared-privacy-providers/services/private-assets/private-assets.service';
import { HINKAL_SUPPORTED_CHAINS } from '../constants/hinkal-supported-chains';
import {
  blockchainsList,
  RankedBlockchain
} from '@app/features/trade/components/assets-selector/services/blockchains-list-service/constants/blockchains-list';
import { disabledFromBlockchains } from '@app/features/trade/components/assets-selector/services/blockchains-list-service/constants/disabled-from-blockchains';
import { blockchainIcon } from '@app/shared/constants/blockchain/blockchain-icon';
import { blockchainLabel } from '@app/shared/constants/blockchain/blockchain-label';
import { HinkalFacadeService } from './hinkal-sdk/hinkal-facade.service';
import { BehaviorSubject } from 'rxjs';
import { BlockchainName } from '@cryptorubic/core';

@Injectable()
export class HinkalPrivateAssetsService extends PrivateAssetsService {
  private readonly _activeChain$ = new BehaviorSubject<BlockchainName | null>(null);

  private readonly hinkalFacade = inject(HinkalFacadeService);

  constructor() {
    super('from', HINKAL_SUPPORTED_CHAINS);
    this.subscribeOnNetworkChanged();
  }

  private subscribeOnNetworkChanged(): void {
    this.hinkalFacade.activeChain$.subscribe(chain => {
      this._activeChain$.next(chain);
      this.updateAvailableChain();
    });
  }

  private updateAvailableChain(): void {
    this.setAvailableBlockchains();
    this.blockchainsToShow = this._availableBlockchains;
    this.assetsBlockchainsToShow = this._availableBlockchains;
  }

  protected override async setAvailableBlockchains(): Promise<void> {
    let blockchains: readonly RankedBlockchain[] = blockchainsList;
    if (this.queryParamsService.enabledBlockchains) {
      blockchains = blockchains.filter(blockchain =>
        this.queryParamsService.enabledBlockchains.includes(blockchain.name)
      );
    }

    const activeChain = this._activeChain$?.value;
    const activeChains = activeChain ? [activeChain] : this.supportedBlockchains;

    blockchains = blockchains.filter(blockchain => activeChains.includes(blockchain.name));

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
