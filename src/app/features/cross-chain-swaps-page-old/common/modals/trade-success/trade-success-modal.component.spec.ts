import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { TradeSuccessModalComponent } from 'src/app/features/cross-chain-swaps-page-old/common/modals/trade-success/trade-success-modal.component';

describe('BridgeSuccessComponent', () => {
  let component: TradeSuccessModalComponent;
  let fixture: ComponentFixture<TradeSuccessModalComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [TranslateModule.forRoot()],
        declarations: [TradeSuccessModalComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TradeSuccessModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
