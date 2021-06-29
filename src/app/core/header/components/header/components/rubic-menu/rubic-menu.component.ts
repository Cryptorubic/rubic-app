import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  QueryList,
  TemplateRef,
  ViewChildren
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { HeaderStore } from '../../../../services/header.store';
import { UserInterface } from '../../../../../services/auth/models/user.interface';
import { AuthService } from '../../../../../services/auth/auth.service';
import { IBlockchain } from '../../../../../../shared/models/blockchain/IBlockchain';
import { ProviderConnectorService } from '../../../../../services/blockchain/provider-connector/provider-connector.service';

@Component({
  selector: 'app-rubic-menu',
  templateUrl: './rubic-menu.component.html',
  styleUrls: ['./rubic-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RubicMenuComponent implements AfterViewInit, OnDestroy {
  @ViewChildren('dropdownOptionTemplate') dropdownOptionsTemplates: QueryList<TemplateRef<never>>;

  public isOpened = false;

  public readonly $isMobile: Observable<boolean>;

  public $currentUser: Observable<UserInterface>;

  public currentBlockchain: IBlockchain;

  private _onNetworkChanges$: Subscription;

  private _onAddressChanges$: Subscription;

  public menuItems = [
    { title: 'About Company', link: 'about' },
    { title: 'FAQ', link: 'faq' },
    { title: 'Project', link: 'https://rubic.finance/' },
    { title: 'Team', link: 'team' }
  ];

  public menuNavItems = [
    { title: 'Swaps', link: '' },
    { title: 'Order book', link: '', disabled: true, hint: 'Order book is not available in beta.' }
  ];

  constructor(
    private router: Router,
    private headerStore: HeaderStore,
    private authService: AuthService,
    private readonly cdr: ChangeDetectorRef,
    private readonly providerConnectorService: ProviderConnectorService
  ) {
    this.$isMobile = this.headerStore.getMobileDisplayStatus();
    this.$currentUser = this.authService.getCurrentUser();
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
    this._onNetworkChanges$ = this.providerConnectorService.$networkChange.subscribe(network => {
      this.currentBlockchain = network;
      this.cdr.detectChanges();
    });
    this._onAddressChanges$ = this.providerConnectorService.$addressChange.subscribe(() =>
      this.cdr.detectChanges()
    );
  }

  ngOnDestroy(): void {
    this._onNetworkChanges$.unsubscribe();
    this._onAddressChanges$.unsubscribe();
  }

  public getDropdownStatus(opened) {
    this.isOpened = opened;
  }

  public clickNavigate(link) {
    if (link.includes(location.protocol)) {
      window.open(link, '_blank');
    } else {
      this.router.navigate([link]);
    }
    this.isOpened = false;
  }
}
