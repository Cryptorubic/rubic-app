import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ZAMA_PAGES } from '../../constants/zama-pages';
import { BehaviorSubject } from 'rxjs';
import { PageType } from '../../../shared-privacy-providers/components/page-navigation/models/page-type';
import { ZamaFacadeService } from '../../services/zama-sdk/zama-facade.service';

@Component({
  selector: 'app-zama-view',
  templateUrl: './zama-view.component.html',
  styleUrls: ['./zama-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ZamaViewComponent {
  private readonly _activePage$ = new BehaviorSubject<PageType>(ZAMA_PAGES[0]);

  public readonly activePage$ = this._activePage$.asObservable();

  constructor(private readonly zamaFacadeService: ZamaFacadeService) {
    this.initZama();
  }

  private async initZama(): Promise<void> {
    await this.zamaFacadeService.initServices();
  }

  public readonly pages = ZAMA_PAGES;

  public onPageSelect(page: PageType): void {
    this._activePage$.next(page);
  }

  public ngOnDestroy() {
    this.zamaFacadeService.removeSubs();
  }
}
