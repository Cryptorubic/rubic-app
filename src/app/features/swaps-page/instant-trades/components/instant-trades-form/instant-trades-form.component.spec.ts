import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { TradeParametersService } from 'src/app/core/services/swaps/trade-parameters-service/trade-parameters.service';
import { TradeTypeService } from 'src/app/core/services/swaps/trade-type-service/trade-type.service';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { OneInchBscService } from '../../services/one-inch-service/one-inch-bsc-service/one-inch-bsc.service';
import { OneInchEthService } from '../../services/one-inch-service/one-inch-eth-service/one-inch-eth.service';
import { PancakeSwapService } from '../../services/pancake-swap-service/pancake-swap.service';
import { UniSwapService } from '../../services/uni-swap-service/uni-swap.service';
import { InstantTradesFormComponent } from './instant-trades-form.component';
import { SharedModule } from '../../../../../shared/shared.module';
import { backendTestTokens } from '../../../../../../test/tokens/backend-tokens';

describe('InstantTradesFormComponent', () => {
  let component: InstantTradesFormComponent;
  let fixture: ComponentFixture<InstantTradesFormComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        MatDialogModule,
        RouterTestingModule,
        SharedModule,
        TranslateModule.forRoot(),
        HttpClientTestingModule
      ],
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

    httpMock = TestBed.inject(HttpTestingController);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InstantTradesFormComponent);
    component = fixture.componentInstance;
    (component as any).queryParamsService.setupParams({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();

    const tokensRequest = httpMock.expectOne('/api/v1/coingecko_tokens/');
    tokensRequest.flush(backendTestTokens);

    httpMock.verify();
  });
});
