import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TotalSupplyOverflowErrorComponent } from './total-supply-overflow-error.component';
import { TotalSupplyOverflowError } from '../../../../core/errors/models/order-book/TotalSupplyOverflowError';

describe('TotalSupplyOverflowErrorComponent', () => {
  let component: TotalSupplyOverflowErrorComponent;
  let translateService: TranslateService;
  let fixture: ComponentFixture<TotalSupplyOverflowErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [TotalSupplyOverflowErrorComponent]
    }).compileComponents();
    translateService = TestBed.get(TranslateService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TotalSupplyOverflowErrorComponent);
    component = fixture.componentInstance;
    component.totalSupplyOverflowError = new TotalSupplyOverflowError(
      translateService,
      'RBC',
      '124,000,000'
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
