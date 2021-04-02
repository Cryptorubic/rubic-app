import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HighGasPriceModalComponent } from './high-gas-price-modal.component';

describe('HighGasPriceModalComponent', () => {
  let component: HighGasPriceModalComponent;
  let fixture: ComponentFixture<HighGasPriceModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HighGasPriceModalComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HighGasPriceModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
