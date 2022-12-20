import {
  Component,
  ChangeDetectionStrategy,
  Input,
  ChangeDetectorRef,
  OnInit,
  Self
} from '@angular/core';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swap-form/models/swap-provider-type';
import { BlockchainName } from 'rubic-sdk';
import ADDRESS_TYPE from '@shared/models/blockchain/address-type';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { AuthService } from '@core/services/auth/auth.service';
import { SettingsService } from '@features/swaps/core/services/settings-service/settings.service';
import { combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TargetNetworkAddressService } from '@features/swaps/core/services/target-network-address-service/target-network-address.service';
import { blockchainLabel } from '@shared/constants/blockchain/blockchain-label';

@Component({
  selector: 'app-cross-chain-bridge-swap-info',
  templateUrl: './cross-chain-bridge-swap-info.component.html',
  styleUrls: ['./cross-chain-bridge-swap-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class CrossChainBridgeSwapInfoComponent implements OnInit {
  @Input() public swapType: SWAP_PROVIDER_TYPE;

  public readonly SWAP_PROVIDER_TYPE = SWAP_PROVIDER_TYPE;

  public readonly ADDRESS_TYPE = ADDRESS_TYPE;

  public toBlockchain: BlockchainName;

  public toWalletAddress: string;

  public isWalletCopied: boolean;

  public get blockchainLabel(): string {
    return blockchainLabel[this.toBlockchain];
  }

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly swapFormService: SwapFormService,
    private readonly authService: AuthService,
    private readonly settingsService: SettingsService,
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly targetNetworkAddressService: TargetNetworkAddressService
  ) {
    this.isWalletCopied = false;
  }

  ngOnInit() {
    this.initSubscriptions();
  }

  private initSubscriptions(): void {
    combineLatest([
      this.swapFormService.toBlockchain$,
      this.authService.currentUser$,
      this.targetNetworkAddressService.address$
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([toBlockchain, user, targetAddress]) => {
        this.toBlockchain = toBlockchain;
        this.toWalletAddress = targetAddress ?? user?.address;

        this.cdr.detectChanges();
      });
  }

  public onWalletAddressCopied(): void {
    this.isWalletCopied = true;
    setTimeout(() => {
      this.isWalletCopied = false;
      this.cdr.markForCheck();
    }, 700);
  }
}
