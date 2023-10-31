import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RubicBadgeComponent } from './rubic-badge.component';

describe('RubicBadgeComponent', () => {
  let component: RubicBadgeComponent;
  let fixture: ComponentFixture<RubicBadgeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RubicBadgeComponent]
    });
    fixture = TestBed.createComponent(RubicBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
