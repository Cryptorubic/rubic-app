import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { HeaderStore } from '@app/core/header/services/header.store';
import { WalletConnectorService } from '@app/core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { BLOCKCHAIN_NAME } from '@app/shared/models/blockchain/blockchain-name';
import { Token } from '@app/shared/models/tokens/token';
import { ENVIRONMENT } from 'src/environments/environment';
import { TokenLpParsed } from '../../models/token-lp.interface';

@Component({
  selector: 'app-deposit-card',
  templateUrl: './deposit-card.component.html',
  styleUrls: ['./deposit-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe]
})
export class DepositCardComponent {
  @Input() deposit: TokenLpParsed;

  @Input() loading: boolean;

  @Output() onCollectRewards = new EventEmitter<void>();

  @Output() onRequestWithdraw = new EventEmitter<void>();

  @Output() onWithdraw = new EventEmitter<void>();

  public readonly isMobile$ = this.headerStore.getMobileDisplayStatus();

  constructor(
    private readonly headerStore: HeaderStore,
    private readonly datePipe: DatePipe,
    private readonly walletConnectorService: WalletConnectorService
  ) {}

  public getStartTime(startTime: Date): string {
    if (this.headerStore.isMobile) {
      return this.datePipe.transform(startTime, 'mediumDate');
    } else {
      return `${this.datePipe.transform(startTime, 'dd LLLL')} at ${this.datePipe.transform(
        startTime,
        'shortTime'
      )}`;
    }
  }

  public async addToMetamask(): Promise<void> {
    const lpToken: Token = {
      symbol: 'LP',
      blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
      address: ENVIRONMENT.lpProviding.contractAddress,
      decimals: 18,
      image: '',
      rank: 0,
      price: 0,
      usedInIframe: false,
      name: 'LP token',
      hasDirectPair: false
    };

    await this.walletConnectorService.addNftToken(lpToken);
  }
}
