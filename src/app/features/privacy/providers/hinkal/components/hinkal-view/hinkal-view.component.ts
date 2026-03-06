import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HinkalFacadeService } from '../../services/hinkal-sdk/hinkal-facade.service';
import { HINKAL_PAGES } from '../../constants/hinkal-pages';
import { BehaviorSubject } from 'rxjs';
import { PageType } from '../../../shared-privacy-providers/components/page-navigation/models/page-type';

@Component({
  selector: 'app-hinkal-view',
  templateUrl: './hinkal-view.component.html',
  styleUrls: ['./hinkal-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HinkalViewComponent {
  private readonly _activePage$ = new BehaviorSubject<PageType>(HINKAL_PAGES[0]);

  public readonly activePage$ = this._activePage$.asObservable();

  public readonly pages = HINKAL_PAGES;

  public onPageSelect(page: PageType): void {
    this._activePage$.next(page);
  }

  constructor(private readonly hinkalFacadeService: HinkalFacadeService) {}

  ngOnDestroy() {
    this.hinkalFacadeService.removeSubs();
  }
}
