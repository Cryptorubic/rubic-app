import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { BlockchainName } from '@shared/models/blockchain/blockchain-name';
import { AbstractControl, FormControl, ValidatorFn } from '@ngneat/reactive-forms';
import { Validators } from '@angular/forms';
import { SolanaWeb3Public } from '@core/services/blockchain/blockchain-adapters/solana/solana-web3-public';
import { EthLikeWeb3Public } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-public/eth-like-web3-public';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { ValidationErrors } from '@ngneat/reactive-forms/lib/types';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { StoreService } from '@core/services/store/store.service';
import { TargetNetworkAddressService } from '@features/swaps/features/cross-chain-routing/services/target-network-address-service/target-network-address.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { NearWeb3Public } from '@core/services/blockchain/blockchain-adapters/near/near-web3-public';

function correctAddressValidator(
  blockchainAdapter: EthLikeWeb3Public | SolanaWeb3Public | NearWeb3Public
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const isAddressCorrect = blockchainAdapter.isAddressCorrect(control.value);
    return isAddressCorrect ? null : { wrongAddress: control.value };
  };
}

@Component({
  selector: 'app-target-network-address',
  templateUrl: './target-network-address.component.html',
  styleUrls: ['./target-network-address.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class TargetNetworkAddressComponent implements OnInit {
  @Input() set targetBlockchain(blockchain: BlockchainName) {
    this.address.clearValidators();
    this.address.setValidators(Validators.required);
    this.targetBlockchainName = blockchain;
    const blockchainAdapter = this.blockchainAdapterService[blockchain];
    this.address.setValidators(correctAddressValidator(blockchainAdapter));
  }

  public targetBlockchainName: BlockchainName;

  public address: FormControl<string>;

  constructor(
    private readonly blockchainAdapterService: PublicBlockchainAdapterService,
    private readonly storeService: StoreService,
    private readonly targetNetworkAddressService: TargetNetworkAddressService,
    private readonly destroy$: TuiDestroyService
  ) {
    this.address = new FormControl<string>(null, [Validators.required]);
    this.address.markAsDirty();
  }

  ngOnInit() {
    this.initSubscription();
    this.setTargetAddress();
  }

  private setTargetAddress(): void {
    const targetAddress = this.storeService.getItem('targetAddress');
    if (targetAddress?.blockchain === this.targetBlockchainName) {
      this.address.patchValue(targetAddress.address);
    }
  }

  private initSubscription(): void {
    this.address.valueChanges
      .pipe(debounceTime(10), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.address.valid) {
          this.storeService.setItem('targetAddress', {
            address: this.address.value,
            blockchain: this.targetBlockchainName
          });
        }
        this.targetNetworkAddressService.targetAddress = {
          value: this.address.value,
          isValid: this.address.valid
        };
      });
  }
}
