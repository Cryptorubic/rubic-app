import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CnTradeInfoComponent } from './cn-trade-info.component';

describe('CnTradeInfoComponent', () => {
  let component: CnTradeInfoComponent;
  let fixture: ComponentFixture<CnTradeInfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CnTradeInfoComponent]
    });
    fixture = TestBed.createComponent(CnTradeInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
