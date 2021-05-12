import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WalletAddressFormComponent } from './wallet-address-form.component';

describe('AddressInputComponent', () => {
  let component: WalletAddressFormComponent;
  let fixture: ComponentFixture<WalletAddressFormComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [WalletAddressFormComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletAddressFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
