import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { PrivacyForm, PrivacyFormValue } from './models/privacy-form';
import { BehaviorSubject, Observable, combineLatestWith, map, of, startWith } from 'rxjs';
import { PrivateProviderInfoUI } from '../models/provider-info';
import { PrivateActivityItem, PrivateActivityStorageItem } from '../models/activity-item';
import { PRIVATE_PROVIDERS_ICONS } from '../constants/private-providers-icons';
import { PRIVATE_PROVIDERS_UI } from '../constants/private-providers-ui';
import { PRIVATE_PROVIDERS_CHAINS_MAP } from '../constants/private-providers-chains-map';
import { PrivateAction } from '../constants/private-mode-tx-types';
import { PRIVATE_PROVIDERS_ACTIONS_MAP } from '../constants/private-providers-actions-map';

const FAKE_ACTIVITY: PrivateActivityStorageItem[] = [
  { providerName: 'HINKAL', type: 'swap' },
  { providerName: 'ZAMA', type: 'transfer' },
  { providerName: 'HINKAL', type: 'transfer' },
  { providerName: 'RAILGUN', type: 'swap' }
];

@Injectable()
export class PrivacyMainPageService {
  private readonly form = new FormGroup<PrivacyForm>({
    fromAsset: new FormControl(null),
    toAsset: new FormControl(null)
  });

  private readonly _selectedTab$ = new BehaviorSubject<PrivateAction>('Swap');

  public readonly selectedTab$ = this._selectedTab$.asObservable();

  public readonly privateProviders$: Observable<PrivateProviderInfoUI[]> = of(
    PRIVATE_PROVIDERS_UI
  ).pipe(
    combineLatestWith(this.form.valueChanges, this.selectedTab$),
    map(([privateProviders, formValue, selectedTab]) => {
      return this.filterProviders(privateProviders, formValue, selectedTab);
    }),
    startWith(PRIVATE_PROVIDERS_UI)
  );

  // @TODO_1712 использовать реальную активность из локал стора
  public readonly lastActivity$: Observable<PrivateActivityItem[]> = of(FAKE_ACTIVITY).pipe(
    map(activity =>
      activity.slice(-4).map(el => ({ ...el, icon: PRIVATE_PROVIDERS_ICONS[el.providerName] }))
    )
  );

  constructor() {}

  public setSelectedTab(tab: PrivateAction): void {
    this._selectedTab$.next(tab);
  }

  public patchFormValue(value: Partial<PrivacyFormValue>): void {
    this.form.patchValue(value);
  }

  private filterProviders(
    privateProviders: PrivateProviderInfoUI[],
    formValue: Partial<PrivacyFormValue>,
    selectedTab: PrivateAction
  ): PrivateProviderInfoUI[] {
    if (!formValue.fromAsset || !formValue.toAsset) return privateProviders;

    const srcChain = formValue.fromAsset.blockchain;
    const dstChain = formValue.toAsset.blockchain;

    return privateProviders.filter(provider => {
      const supportedChains = PRIVATE_PROVIDERS_CHAINS_MAP[provider.name];
      if (!supportedChains.includes(srcChain) || !supportedChains.includes(dstChain)) {
        return false;
      }
      const srcChainActions =
        PRIVATE_PROVIDERS_ACTIONS_MAP[provider.name][formValue.fromAsset.blockchain];
      const dstChainActions =
        PRIVATE_PROVIDERS_ACTIONS_MAP[provider.name][formValue.toAsset.blockchain];
      if (!srcChainActions.includes(selectedTab) || !dstChainActions.includes(selectedTab)) {
        return false;
      }
      return true;
    });
  }
}
