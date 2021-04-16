import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TradeTypeService } from 'src/app/core/services/swaps/trade-type-service/trade-type.service';

import { TradesFormComponent } from './trades-form.component';

describe('TradesFormComponent', () => {
  let component: TradesFormComponent;
  let fixture: ComponentFixture<TradesFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [TradeTypeService],
      declarations: [TradesFormComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TradesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
