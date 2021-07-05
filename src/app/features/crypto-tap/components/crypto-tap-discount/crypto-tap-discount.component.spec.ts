import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CryptoTapDiscountComponent } from './crypto-tap-discount.component';

describe('CryptoTapDiscountComponent', () => {
  let component: CryptoTapDiscountComponent;
  let fixture: ComponentFixture<CryptoTapDiscountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CryptoTapDiscountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CryptoTapDiscountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
