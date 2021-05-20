import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { TradeInProgressModalComponent } from 'src/app/features/cross-chain-swaps-page/common/modals/trade-in-progress/trade-in-progress-modal.component';

describe('BridgeInProgressModalComponent', () => {
  let component: TradeInProgressModalComponent;
  let fixture: ComponentFixture<TradeInProgressModalComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [TranslateModule.forRoot()],
        declarations: [TradeInProgressModalComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TradeInProgressModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
