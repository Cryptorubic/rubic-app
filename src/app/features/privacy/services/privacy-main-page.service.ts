import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { PrivacyForm, PrivacyFormValue } from './models/privacy-form';
import {
  BehaviorSubject,
  Observable,
  combineLatestWith,
  distinctUntilChanged,
  forkJoin,
  map,
  of,
  switchMap
} from 'rxjs';
import { PrivateProviderInfoUI, PrivateProviderRawInfo } from '../models/provider-info';
import { PrivateActivityItem, PrivateActivityStorageItem } from '../models/activity-item';
import { PRIVATE_PROVIDERS_CHAINS_MAP } from '../constants/private-providers-chains-map';
import { PRIVATE_MODE_TAB, PrivateModeTab } from '../constants/private-mode-tab';
import { PRIVATE_PROVIDERS_TABS_MAP } from '../constants/private-providers-tabs-map';
import { PRIVATE_PROVIDERS_UI } from '../constants/private-providers-ui';
import { PrivacyApiService } from './privacy-api.service';

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

  public get formValue(): PrivacyFormValue {
    return this.form.value as PrivacyFormValue;
  }

  public readonly swapInfo$ = this.form.valueChanges.pipe(
    distinctUntilChanged(),
    map(swapInfo => swapInfo as PrivacyFormValue)
  );

  private readonly _selectedTab$ = new BehaviorSubject<PrivateModeTab>(PRIVATE_MODE_TAB.ON_CHAIN);

  public readonly selectedTab$ = this._selectedTab$.asObservable();

  public readonly privateProviders$: Observable<PrivateProviderInfoUI[]> = of(
    PRIVATE_PROVIDERS_UI
  ).pipe(
    combineLatestWith(this.form.valueChanges, this.selectedTab$),
    switchMap(([privateProvidersRaw, formValue, selectedTab]) => {
      const privateProviders$ = this.loadDynamicParams(privateProvidersRaw, formValue, selectedTab);
      return forkJoin([privateProviders$, of(formValue), of(selectedTab)]);
    }),
    map(([privateProviders, formValue, selectedTab]) => {
      return this.filterProviders(privateProviders, formValue, selectedTab);
    })
  );

  // @TODO_1712 использовать реальную активность из локал стора
  public readonly lastActivity$: Observable<PrivateActivityItem[]> = of(FAKE_ACTIVITY).pipe(
    map(() => [])
  );

  constructor(private readonly privacyApiService: PrivacyApiService) {}

  public setSelectedTab(tab: PrivateModeTab): void {
    this._selectedTab$.next(tab);
  }

  public patchFormValue(value: Partial<PrivacyFormValue>): void {
    this.form.patchValue(value);
  }

  private loadDynamicParams(
    privateProvidersRaw: PrivateProviderRawInfo[],
    formValue: Partial<PrivacyFormValue>,
    selectedTab: PrivateModeTab
  ): Promise<PrivateProviderInfoUI[]> {
    return Promise.all(
      privateProvidersRaw.map(providerInfo => {
        return providerInfo.getFeeSize(selectedTab, formValue, this.privacyApiService).then(
          feeMsg =>
            ({
              ...providerInfo,
              feeSize: feeMsg,
              minAmountUsd: providerInfo.getMinAmountUsd(selectedTab)
            } as PrivateProviderInfoUI)
        );
      })
    );
  }

  private filterProviders(
    privateProviders: PrivateProviderInfoUI[],
    formValue: Partial<PrivacyFormValue>,
    selectedTab: PrivateModeTab
  ): PrivateProviderInfoUI[] {
    if (!formValue.fromAsset && !formValue.toAsset) return privateProviders;

    const srcChain = formValue.fromAsset?.blockchain;
    const dstChain = formValue.toAsset?.blockchain;

    return privateProviders.filter(provider => {
      const supportedChains = PRIVATE_PROVIDERS_CHAINS_MAP[provider.name];
      if (
        (srcChain && !supportedChains.includes(srcChain)) ||
        (dstChain && !supportedChains.includes(dstChain))
      ) {
        return false;
      }
      const srcChainTabs =
        PRIVATE_PROVIDERS_TABS_MAP[provider.name][formValue.fromAsset?.blockchain];
      const dstChainTabs = PRIVATE_PROVIDERS_TABS_MAP[provider.name][formValue.toAsset?.blockchain];
      if (
        (srcChainTabs && !srcChainTabs.includes(selectedTab)) ||
        (dstChainTabs && !dstChainTabs.includes(selectedTab))
      ) {
        return false;
      }
      return true;
    });
  }
}
