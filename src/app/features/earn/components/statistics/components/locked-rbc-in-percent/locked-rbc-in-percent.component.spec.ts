import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LockedRbcInPercentComponent } from './locked-rbc-in-percent.component';

describe('LockedRbcInPercentComponent', () => {
  let component: LockedRbcInPercentComponent;
  let fixture: ComponentFixture<LockedRbcInPercentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LockedRbcInPercentComponent]
    });
    fixture = TestBed.createComponent(LockedRbcInPercentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
