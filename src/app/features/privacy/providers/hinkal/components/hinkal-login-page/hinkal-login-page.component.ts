import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HinkalInstanceService } from '../../services/hinkal-sdk/hinkal-instance.service';
import { map } from 'rxjs';
import { HinkalFacadeService } from '../../services/hinkal-sdk/hinkal-facade.service';
import { HINKAL_SUPPORTED_WALLETS } from '../../constants/hinkal-supported-wallets';

@Component({
  selector: 'app-hinkal-login-page',
  templateUrl: './hinkal-login-page.component.html',
  styleUrls: ['./hinkal-login-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class HinkalLoginPageComponent {
  public readonly authorized$ = this.hinkalInstanceService.currSignature$.pipe(
    map(signature => Boolean(signature))
  );

  public readonly supportedWallets = HINKAL_SUPPORTED_WALLETS;

  constructor(
    private readonly hinkalInstanceService: HinkalInstanceService,
    private readonly hinkalFacadeService: HinkalFacadeService
  ) {}

  public async handleClick(): Promise<void> {
    await this.hinkalFacadeService.updateInstance();
  }
}
