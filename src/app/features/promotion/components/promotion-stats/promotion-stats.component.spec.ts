import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromotionStatsComponent } from './promotion-stats.component';

describe('PromotionStatsComponent', () => {
  let component: PromotionStatsComponent;
  let fixture: ComponentFixture<PromotionStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PromotionStatsComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PromotionStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
