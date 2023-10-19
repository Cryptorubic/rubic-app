import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RewardPerWeekComponent } from './reward-per-week.component';

describe('RewardPerWeekComponent', () => {
  let component: RewardPerWeekComponent;
  let fixture: ComponentFixture<RewardPerWeekComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RewardPerWeekComponent]
    });
    fixture = TestBed.createComponent(RewardPerWeekComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
