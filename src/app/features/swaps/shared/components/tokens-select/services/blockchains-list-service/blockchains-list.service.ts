import { Injectable } from '@angular/core';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { PlatformConfigurationService } from '@core/services/backend/platform-configuration/platform-configuration.service';
import { AvailableBlockchain } from '@features/swaps/shared/components/tokens-select/services/blockchains-list-service/models/available-blockchain';
import { blockchainsList } from '@features/swaps/shared/components/tokens-select/services/blockchains-list-service/constants/blockchains-list';
import { disabledFromBlockchains } from '@features/swaps/shared/components/tokens-select/services/blockchains-list-service/constants/disabled-from-blockchains';
import { blockchainIcon } from '@shared/constants/blockchain/blockchain-icon';
import { blockchainLabel } from '@shared/constants/blockchain/blockchain-label';
import { TokensSelectService } from '@features/swaps/shared/components/tokens-select/services/tokens-select-service/tokens-select.service';

@Injectable()
export class BlockchainsListService {
  public readonly availableBlockchains: AvailableBlockchain[];

  constructor(
    private readonly queryParamsService: QueryParamsService,
    private readonly platformConfigurationService: PlatformConfigurationService,
    private readonly tokensSelectService: TokensSelectService
  ) {
    let blockchains = blockchainsList;
    if (queryParamsService.enabledBlockchains) {
      blockchains = blockchains.filter(blockchain =>
        queryParamsService.enabledBlockchains.includes(blockchain)
      );
    }
    this.availableBlockchains = blockchains.map(blockchainName => {
      const disabledConfiguration =
        !this.platformConfigurationService.isAvailableBlockchain(blockchainName);
      const disabledFrom = disabledFromBlockchains.includes(blockchainName);

      return {
        name: blockchainName,
        icon: blockchainIcon[blockchainName],
        label: blockchainLabel[blockchainName],
        disabledConfiguration,
        disabledFrom
      };
    });
  }

  public isDisabled(blockchain: AvailableBlockchain): boolean {
    return blockchain.disabledConfiguration || this.isDisabledFrom(blockchain);
  }

  public isDisabledFrom(blockchain: AvailableBlockchain): boolean {
    return this.tokensSelectService.formType === 'from' && blockchain.disabledFrom;
  }

  public getHintText(blockchain: AvailableBlockchain): string | null {
    if (this.isDisabledFrom(blockchain)) {
      return 'Select as target network';
    }
    if (blockchain.disabledConfiguration) {
      return 'Temporary disabled';
    }
    return null;
  }
}
