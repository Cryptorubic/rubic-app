import { Injectable } from '@angular/core';
import { PageType } from '@app/features/privacy/providers/shared-privacy-providers/components/page-navigation/models/page-type';
import { BehaviorSubject } from 'rxjs';

// TODO add to other providers
@Injectable()
export class PrivatePageTypeService {
  private readonly _activePage$ = new BehaviorSubject<PageType | undefined>(undefined);

  public readonly activePage$ = this._activePage$.asObservable();

  public set activePage(value: PageType) {
    this._activePage$.next(value);
  }

  constructor() {}
}
