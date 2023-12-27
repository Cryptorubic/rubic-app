import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromotionBadgeComponent } from './promotion-badge.component';

describe('PromotionBadgeComponent', () => {
  let component: PromotionBadgeComponent;
  let fixture: ComponentFixture<PromotionBadgeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PromotionBadgeComponent]
    });
    fixture = TestBed.createComponent(PromotionBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
