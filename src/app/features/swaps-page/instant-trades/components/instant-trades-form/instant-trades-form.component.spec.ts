import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { TradeParametersService } from 'src/app/core/services/swaps/trade-parameters-service/trade-parameters.service';
import { TradeTypeService } from 'src/app/core/services/swaps/trade-type-service/trade-type.service';
import { OneInchBscService } from '../../services/one-inch-service/one-inch-bsc-service/one-inch-bsc.service';
import { OneInchEthService } from '../../services/one-inch-service/one-inch-eth-service/one-inch-eth.service';
import { PancakeSwapService } from '../../services/pancake-swap-service/pancake-swap.service';
import { UniSwapService } from '../../services/uni-swap-service/uni-swap.service';

import { InstantTradesFormComponent } from './instant-trades-form.component';

describe('InstantTradesFormComponent', () => {
  let component: InstantTradesFormComponent;
  let fixture: ComponentFixture<InstantTradesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientModule, MatDialogModule],
      providers: [
        TradeTypeService,
        TradeParametersService,
        UniSwapService,
        OneInchEthService,
        OneInchBscService,
        PancakeSwapService
      ],
      declarations: [InstantTradesFormComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InstantTradesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
