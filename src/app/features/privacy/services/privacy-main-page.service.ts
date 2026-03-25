import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { PrivacyForm, PrivacyFormValue } from './models/privacy-form';
import {
  BehaviorSubject,
  Observable,
  combineLatestWith,
  defer,
  distinctUntilChanged,
  map,
  of,
  startWith,
  switchMap
} from 'rxjs';
import { PrivateProviderInfoUI, PrivateProviderRawInfo } from '../models/provider-info';
import { PrivateActivityItem, PrivateActivityStorageItem } from '../models/activity-item';
import { PRIVATE_PROVIDERS_CHAINS_MAP } from '../constants/private-providers-chains-map';
import { PRIVATE_MODE_TAB, PrivateModeTab } from '../constants/private-mode-tab';
import { PRIVATE_PROVIDERS_TABS_MAP } from '../constants/private-providers-tabs-map';
import { PRIVATE_PROVIDERS_UI } from '../constants/private-providers-ui';
import { PrivacyApiService } from './privacy-api.service';
import { StoreService } from '@app/core/services/store/store.service';

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

  public readonly swapInfo$ = defer(() =>
    this.form.valueChanges.pipe(
      distinctUntilChanged(),
      map(swapInfo => swapInfo as PrivacyFormValue),
      startWith(this.form.value as PrivacyFormValue)
    )
  );

  private readonly _selectedTab$ = new BehaviorSubject<PrivateModeTab>(PRIVATE_MODE_TAB.ON_CHAIN);

  public readonly selectedTab$ = this._selectedTab$.asObservable();

  private readonly _showAllProviders$ = new BehaviorSubject<boolean>(
    this.storeService.getItem('SHOW_ALL_PROVIDERS_KEY')
  );

  public readonly showAllProviders$ = this._showAllProviders$.asObservable();

  public readonly privateProviders$: Observable<PrivateProviderInfoUI[]> = of(
    PRIVATE_PROVIDERS_UI
  ).pipe(
    combineLatestWith(this.swapInfo$, this.selectedTab$, this.showAllProviders$),
    map(([privateProviders, formValue, selectedTab, showAllProviders]) => {
      return [
        this.filterProviders(privateProviders, formValue, selectedTab, showAllProviders),
        formValue,
        selectedTab
      ];
    }),
    switchMap(
      ([privateProviders, formValue, selectedTab]: [
        PrivateProviderRawInfo[],
        PrivacyFormValue,
        PrivateModeTab
      ]) => {
        return this.loadDynamicParams(privateProviders, formValue, selectedTab);
      }
    )
  );

  // @TODO_1712 использовать реальную активность из локал стора
  public readonly lastActivity$: Observable<PrivateActivityItem[]> = of(FAKE_ACTIVITY).pipe(
    map(() => [])
  );

  public get selectedTab(): PrivateModeTab {
    return this._selectedTab$.getValue();
  }

  public get swapInfo(): Partial<PrivacyFormValue> {
    return this.form.value;
  }

  constructor(
    private readonly privacyApiService: PrivacyApiService,
    private readonly storeService: StoreService
  ) {}

  public setSelectedTab(tab: PrivateModeTab): void {
    this._selectedTab$.next(tab);
  }

  public patchFormValue(value: Partial<PrivacyFormValue>): void {
    this.form.patchValue(value);
  }

  public setShowAllProviders(show: boolean): void {
    this.storeService.setItem('SHOW_ALL_PROVIDERS_KEY', show);
    this._showAllProviders$.next(show);
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
    privateProviders: PrivateProviderRawInfo[],
    formValue: Partial<PrivacyFormValue>,
    selectedTab: PrivateModeTab,
    showAllProviders: boolean
  ): PrivateProviderRawInfo[] {
    if (showAllProviders)
      return privateProviders.filter(provider =>
        PRIVATE_PROVIDERS_TABS_MAP[provider.name].includes(selectedTab)
      );

    if (!formValue.fromAsset || (selectedTab !== PRIVATE_MODE_TAB.TRANSFER && !formValue.toAsset))
      return [];

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

      const supportedTabs = PRIVATE_PROVIDERS_TABS_MAP[provider.name];
      if (!supportedTabs.includes(selectedTab)) {
        return false;
      }

      return true;
    });
  }
}
