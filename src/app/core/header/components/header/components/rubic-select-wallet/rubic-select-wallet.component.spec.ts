import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RubicSelectWalletComponent } from './rubic-select-wallet.component';

describe('RubicSelectWalletComponent', () => {
  let component: RubicSelectWalletComponent;
  let fixture: ComponentFixture<RubicSelectWalletComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RubicSelectWalletComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RubicSelectWalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
