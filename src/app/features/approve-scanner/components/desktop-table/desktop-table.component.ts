import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ApproveTransaction } from '@features/approve-scanner/services/approve-scanner.service';
import { FormControl } from '@angular/forms';
import ADDRESS_TYPE from '@app/shared/models/blockchain/address-type';

@Component({
  selector: 'app-desktop-table',
  templateUrl: './desktop-table.component.html',
  styleUrls: ['./desktop-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DesktopTableComponent {
  @Input() public readonly approves: ApproveTransaction[];

  @Input() public readonly allApproves: ApproveTransaction[];

  @Input() public readonly page: number;

  @Input() public readonly size: number;

  @Input() public readonly isLimitsExceeded: boolean;

  @Input() public readonly allowChangeBlockchain: boolean;

  @Input() public readonly tokenControl: FormControl<string>;

  @Input() public readonly spenderControl: FormControl<string>;

  @Input() public readonly revokeLoading: boolean;

  @Input() public readonly tableLoading: boolean;

  @Output() public readonly handleNetworkChange = new EventEmitter<void>();

  @Output() public readonly handleRevokeCall = new EventEmitter<{
    token: string;
    spender: string;
  }>();

  public readonly ADDRESS_TYPE = ADDRESS_TYPE;

  constructor() {}

  public changeNetwork(): void {
    this.handleNetworkChange.emit();
  }

  public handleRevoke(token: string, spender: string): void {
    this.handleRevokeCall.emit({ token, spender });
  }
}
