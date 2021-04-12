import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TradeParametersService } from 'src/app/core/services/swaps/trade-parameters-service/trade-parameters.service';
import { TradeTypeService } from 'src/app/core/services/swaps/trade-type-service/trade-type.service';

import { InstantTradesFormComponent } from './instant-trades-form.component';

describe('InstantTradesFormComponent', () => {
  let component: InstantTradesFormComponent;
  let fixture: ComponentFixture<InstantTradesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [TradeTypeService, TradeParametersService],
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
