import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { TUI_IS_MOBILE, TuiDestroyService } from '@taiga-ui/cdk';
import { ApproveScannerService } from '@features/approve-scanner/services/approve-scanner.service';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class FormComponent {
  public readonly form = this.approveScannerService.form;

  public readonly supportedBlockchains = this.approveScannerService.supportedBlockchains;

  constructor(
    private readonly approveScannerService: ApproveScannerService,
    @Inject(TUI_IS_MOBILE) public readonly isMobile: boolean
  ) {}
}
