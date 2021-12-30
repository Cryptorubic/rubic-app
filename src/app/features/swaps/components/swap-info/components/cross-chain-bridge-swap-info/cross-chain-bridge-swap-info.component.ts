import {
  Component,
  ChangeDetectionStrategy,
  Input,
  ChangeDetectorRef,
  OnInit,
  Self
} from '@angular/core';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/models/swap-provider-type';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import ADDRESS_TYPE from '@shared/models/blockchain/address-type';
import { SwapFormService } from '@features/swaps/services/swaps-form-service/swap-form.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { AuthService } from '@core/services/auth/auth.service';
import { SettingsService } from '@features/swaps/services/settings-service/settings.service';
import { combineLatest } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';
import { TargetNetworkAddressService } from '@features/cross-chain-routing/components/target-network-address/services/target-network-address.service';
import { BlockchainsInfo } from '@core/services/blockchain/blockchain-info';

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

  public toBlockchain: BLOCKCHAIN_NAME;

  public toWalletAddress: string;

  public isWalletCopied: boolean;

  public get blockchainLabel(): string {
    return BlockchainsInfo.getBlockchainLabel(this.toBlockchain);
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
      this.swapFormService.input.controls.toBlockchain.valueChanges.pipe(
        startWith(this.swapFormService.inputValue.toBlockchain)
      ),
      this.authService.getCurrentUser(),
      this.targetNetworkAddressService.displayAddress$,
      this.targetNetworkAddressService.targetAddress$
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([toBlockchain, user, displayTargetAddress, targetAddress]) => {
        this.toBlockchain = toBlockchain;
        const targetAddressExact = targetAddress?.isValid ? targetAddress.value : null;
        this.toWalletAddress = displayTargetAddress ? targetAddressExact : user?.address;

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
