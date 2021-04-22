import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalSupplyOverflowErrorComponent } from './total-supply-overflow-error.component';

describe('TotalSupplyOverflowErrorComponent', () => {
  let component: TotalSupplyOverflowErrorComponent;
  let fixture: ComponentFixture<TotalSupplyOverflowErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TotalSupplyOverflowErrorComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TotalSupplyOverflowErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
