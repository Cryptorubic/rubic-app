import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ZamaSignatureService } from '../../services/zama-sdk/zama-signature.service';
import { map } from 'rxjs';
import { ZamaFacadeService } from '../../services/zama-sdk/zama-facade.service';

@Component({
  selector: 'app-zama-login-page',
  templateUrl: './zama-login-page.component.html',
  styleUrls: ['./zama-login-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ZamaLoginPageComponent {
  public readonly authorized$ = this.zamaSignatureService.signatureInfo$.pipe(
    map(signature => Boolean(signature))
  );

  public readonly sdkLoading$ = this.zamaFacadeService.sdkLoading$;

  constructor(
    private readonly zamaSignatureService: ZamaSignatureService,
    private readonly zamaFacadeService: ZamaFacadeService
  ) {}

  public async handleClick(): Promise<void> {
    await this.zamaFacadeService.updateSignature();
  }
}
