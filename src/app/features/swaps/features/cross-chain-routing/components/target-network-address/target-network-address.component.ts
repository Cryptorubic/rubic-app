import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { BlockchainName, Web3Pure } from 'rubic-sdk';
import { AbstractControl, FormControl, ValidatorFn } from '@ngneat/reactive-forms';
import { Validators } from '@angular/forms';
import { ValidationErrors } from '@ngneat/reactive-forms/lib/types';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { StoreService } from '@core/services/store/store.service';
import { TargetNetworkAddressService } from '@features/swaps/features/cross-chain-routing/components/target-network-address/services/target-network-address.service';
import { TuiDestroyService } from '@taiga-ui/cdk';

function correctAddressValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const isAddressCorrect = Web3Pure.isAddressCorrect(control.value);
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
    this.address.setValidators(correctAddressValidator());
  }

  public targetBlockchainName: BlockchainName;

  public address: FormControl<string>;

  constructor(
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
