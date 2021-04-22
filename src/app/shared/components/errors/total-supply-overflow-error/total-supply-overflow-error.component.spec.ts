import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslateModule } from '@ngx-translate/core';
import { TotalSupplyOverflowErrorComponent } from './total-supply-overflow-error.component';
import { TotalSupplyOverflowError } from '../../../models/errors/order-book/TotalSupplyOverflowError';

describe('TotalSupplyOverflowErrorComponent', () => {
  let component: TotalSupplyOverflowErrorComponent;
  let fixture: ComponentFixture<TotalSupplyOverflowErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [TotalSupplyOverflowErrorComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TotalSupplyOverflowErrorComponent);
    component = fixture.componentInstance;
    component.totalSupplyOverflowError = new TotalSupplyOverflowError('RBC', '124,000,000');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
