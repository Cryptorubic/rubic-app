import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ApproveTransaction } from '@features/approve-scanner/services/approve-scanner.service';
import { FormControl } from '@angular/forms';
import ADDRESS_TYPE from '@app/shared/models/blockchain/address-type';
import { BlockchainName } from 'rubic-sdk';
import { TokensService } from '@core/services/tokens/tokens.service';

@Component({
  selector: 'app-mobile-table',
  templateUrl: './mobile-table.component.html',
  styleUrls: ['./mobile-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MobileTableComponent {
  @Input() public readonly approves: ApproveTransaction[];

  @Input() public readonly allApproves: ApproveTransaction[];

  @Input() public readonly page: number;

  @Input() public readonly size: number;

  @Input() public readonly isLimitsExceeded: boolean;

  @Input() public readonly allowChangeBlockchain: boolean;

  @Input() public readonly tokenControl: FormControl<string>;

  @Input() public readonly spenderControl: FormControl<string>;

  @Input() public readonly switchLoading: boolean;

  @Input() public readonly tableLoading: boolean;

  @Input() public readonly selectedBlockchain: BlockchainName;

  @Output() public readonly handleNetworkChange = new EventEmitter<() => void>();

  @Output() public readonly handleRevokeCall = new EventEmitter<{
    token: string;
    spender: string;
    callback: () => void;
  }>();

  public readonly ADDRESS_TYPE = ADDRESS_TYPE;

  public readonly defaultTokenImage = 'assets/images/icons/coins/default-token-ico.svg';

  constructor(private readonly tokensService: TokensService) {}

  public changeNetwork(callback: () => void): void {
    this.handleNetworkChange.emit(callback);
  }

  public handleRevoke(token: string, spender: string, callback: () => void): void {
    this.handleRevokeCall.emit({ token, spender, callback });
  }

  public onImageError($event: Event): void {
    this.tokensService.onTokenImageError($event);
  }
}
