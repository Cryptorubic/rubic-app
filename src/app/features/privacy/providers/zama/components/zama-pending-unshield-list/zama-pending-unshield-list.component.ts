import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PendingUnshieldToken } from '../../services/zama-sdk/models/pending-unshield-token';

@Component({
  selector: 'app-zama-pending-unshield-list',
  templateUrl: './zama-pending-unshield-list.component.html',
  styleUrls: ['./zama-pending-unshield-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ZamaPendingUnshieldListComponent {
  @Input({ required: true }) tokens: PendingUnshieldToken[];
}
