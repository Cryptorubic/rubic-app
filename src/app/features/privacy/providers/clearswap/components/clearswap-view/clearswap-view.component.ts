import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CLEARSWAP_PAGES } from '@app/features/privacy/providers/clearswap/constants/clearswap-pages';
import { PageType } from '@app/features/privacy/providers/shared-privacy-providers/components/page-navigation/models/page-type';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-clearswap-view',
  templateUrl: './clearswap-view.component.html',
  styleUrls: ['./clearswap-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClearswapViewComponent {
  private readonly _activePage$ = new BehaviorSubject<PageType>(CLEARSWAP_PAGES[0]);

  public readonly activePage$ = this._activePage$.asObservable();

  public readonly pages = CLEARSWAP_PAGES;

  public onPageSelect(page: PageType): void {
    this._activePage$.next(page);
  }
}
