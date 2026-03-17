import { ChangeDetectionStrategy, Component, Self } from '@angular/core';
import { HinkalFacadeService } from '../../services/hinkal-sdk/hinkal-facade.service';
import { HINKAL_PAGES } from '../../constants/hinkal-pages';
import { PageType } from '../../../shared-privacy-providers/components/page-navigation/models/page-type';
import { BlockchainName } from '@cryptorubic/core';
import { HINKAL_SUPPORTED_CHAINS } from '../../constants/hinkal-supported-chains';
import { PrivatePageTypeService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-page-type/private-page-type.service';
import { AuthService } from '@app/core/services/auth/auth.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { distinctUntilChanged, map, takeUntil } from 'rxjs';
import { HinkalInstanceService } from '../../services/hinkal-sdk/hinkal-instance.service';

@Component({
  selector: 'app-hinkal-view',
  templateUrl: './hinkal-view.component.html',
  styleUrls: ['./hinkal-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class HinkalViewComponent {
  public readonly activePage$ = this.privatePageTypeService.activePage$;

  public readonly activeChain$ = this.hinkalFacadeService.activeChain$;

  public readonly supportedChains = HINKAL_SUPPORTED_CHAINS;

  public readonly pages = HINKAL_PAGES;

  public readonly disabledPages$ = this.hinkalInstanceService.currSignature$.pipe(
    map(signature => (signature ? [] : this.pages.filter(page => page.type !== 'login')))
  );

  constructor(
    private readonly hinkalFacadeService: HinkalFacadeService,
    private readonly hinkalInstanceService: HinkalInstanceService,
    private readonly privatePageTypeService: PrivatePageTypeService,
    private readonly authService: AuthService,
    @Self() private readonly destroy$: TuiDestroyService
  ) {
    this.privatePageTypeService.activePage =
      this.pages.find(page => page.type === 'login') || this.pages[0];
  }

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.hinkalFacadeService.logout();
        this.privatePageTypeService.activePage = this.pages.find(page => page.type === 'login');
      });
  }

  public onPageSelect(page: PageType): void {
    this.privatePageTypeService.activePage = page;
  }

  public onSwitchNetwork(chain: BlockchainName): void {
    this.hinkalFacadeService.switchChain(chain);
  }

  ngOnDestroy() {
    this.hinkalFacadeService.removeSubs();
  }
}
