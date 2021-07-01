import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TotalSupplyOverflowError } from 'src/app/core/errors/models/order-book/TotalSupplyOverflowError';
import { TotalSupplyOverflowErrorComponent } from './total-supply-overflow-error.component';

describe('TotalSupplyOverflowErrorComponent', () => {
  let component: TotalSupplyOverflowErrorComponent;
  let translateService: TranslateService;
  let fixture: ComponentFixture<TotalSupplyOverflowErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [TotalSupplyOverflowErrorComponent]
    }).compileComponents();
    translateService = TestBed.inject(TranslateService);
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
