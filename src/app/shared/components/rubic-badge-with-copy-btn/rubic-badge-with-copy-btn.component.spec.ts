import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RubicBadgeWithCopyBtnComponent } from './rubic-badge-with-copy-btn.component';

describe('RubicBadgeWithCopyBtnComponent', () => {
  let component: RubicBadgeWithCopyBtnComponent;
  let fixture: ComponentFixture<RubicBadgeWithCopyBtnComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RubicBadgeWithCopyBtnComponent]
    });
    fixture = TestBed.createComponent(RubicBadgeWithCopyBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
