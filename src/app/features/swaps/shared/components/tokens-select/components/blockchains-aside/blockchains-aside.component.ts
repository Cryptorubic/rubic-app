import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  Output
} from '@angular/core';
import { BlockchainName } from 'rubic-sdk';
import { TUI_IS_IOS, TUI_IS_MOBILE } from '@taiga-ui/cdk';
import { USER_AGENT } from '@ng-web-apis/common';
import { allBlockchains } from '@features/swaps/shared/components/tokens-select/constants/all-blockchains';
import { blockchainIcon } from '@shared/constants/blockchain/blockchain-icon';
import { blockchainLabel } from '@shared/constants/blockchain/blockchain-label';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { disabledFromBlockchains } from '@features/swaps/shared/components/tokens-select/constants/disabled-from-blockchains';
import { PlatformConfigurationService } from '@app/core/services/backend/platform-configuration/platform-configuration.service';

@Component({
  selector: 'app-blockchains-aside',
  templateUrl: './blockchains-aside.component.html',
  styleUrls: ['./blockchains-aside.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlockchainsAsideComponent {
  @Input() blockchain: BlockchainName;

  @Input() formType: 'from' | 'to';

  @Input() idPrefix: string;

  @Output() blockchainChange = new EventEmitter<BlockchainName>();

  public static readonly allBlockchains: BlockchainName[] = allBlockchains;

  public blockchainIcon = blockchainIcon;

  public blockchainLabel = blockchainLabel;

  public get showClearFix(): boolean {
    const safariDetector: RegExp = /iPhone/i;
    const chromeDetector: RegExp = /Chrome/i;
    return (
      this.isIos &&
      this.isMobile &&
      (safariDetector.test(this.userAgent) || chromeDetector.test(this.userAgent))
    );
  }

  public get blockchains(): BlockchainName[] {
    if (this.queryParamsService.enabledBlockchains) {
      return BlockchainsAsideComponent.allBlockchains.filter(blockchain => {
        return this.queryParamsService.enabledBlockchains.includes(blockchain);
      });
    }

    return BlockchainsAsideComponent.allBlockchains;
  }

  constructor(
    @Inject(TUI_IS_IOS) private readonly isIos: boolean,
    @Inject(TUI_IS_MOBILE) private readonly isMobile: boolean,
    @Inject(USER_AGENT) private readonly userAgent: string,
    private readonly queryParamsService: QueryParamsService,
    private readonly platformConfigurationService: PlatformConfigurationService
  ) {}

  public isDisabledFromBlockchain(blockchain: BlockchainName): boolean {
    return this.formType === 'from' && disabledFromBlockchains.includes(blockchain);
  }

  public onBlockchainSelect(blockchainName: BlockchainName): void {
    this.blockchain = blockchainName;
    this.blockchainChange.emit(blockchainName);
  }

  public isDisabledConfigurationBlockchain(blockchainName: BlockchainName): boolean {
    return this.platformConfigurationService.isAvailableBlockchain(blockchainName);
  }
}
