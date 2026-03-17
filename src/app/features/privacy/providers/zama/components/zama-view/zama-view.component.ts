import { ChangeDetectionStrategy, Component, Self } from '@angular/core';
import { ZAMA_PAGES } from '../../constants/zama-pages';
import { PageType } from '../../../shared-privacy-providers/components/page-navigation/models/page-type';
import { ZamaFacadeService } from '../../services/zama-sdk/zama-facade.service';
import { PrivatePageTypeService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-page-type/private-page-type.service';
import { AuthService } from '@app/core/services/auth/auth.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { distinctUntilChanged, map, takeUntil } from 'rxjs';
import { ZamaSignatureService } from '../../services/zama-sdk/zama-signature.service';

@Component({
  selector: 'app-zama-view',
  templateUrl: './zama-view.component.html',
  styleUrls: ['./zama-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class ZamaViewComponent {
  public readonly activePage$ = this.privatePageTypeService.activePage$;

  public readonly pages = ZAMA_PAGES;

  public readonly disabledPages$ = this.zamaSignatureService.signatureInfo$.pipe(
    map(signature => (signature ? [] : this.pages.filter(page => page.type !== 'login')))
  );

  constructor(
    private readonly zamaFacadeService: ZamaFacadeService,
    private readonly privatePageTypeService: PrivatePageTypeService,
    private readonly authService: AuthService,
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly zamaSignatureService: ZamaSignatureService
  ) {
    this.privatePageTypeService.activePage = this.pages[0];
    this.initZama();
  }

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.zamaSignatureService.resetSignature();
        this.privatePageTypeService.activePage = this.pages.find(page => page.type === 'login');
      });
  }

  private async initZama(): Promise<void> {
    await this.zamaFacadeService.initServices();
  }

  public onPageSelect(page: PageType): void {
    this.privatePageTypeService.activePage = page;
  }
}
