import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';

@Component({
  selector: 'app-all-swap-backups-failed-modal',
  templateUrl: './all-swap-backups-failed-modal.component.html',
  styleUrls: ['./all-swap-backups-failed-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class AllSwapBackupsFailedModalComponent {
  constructor(@Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext<boolean>) {}
}
