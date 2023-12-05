import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AverageLockTimeComponent } from './average-lock-time.component';

describe('AverageLockTimeComponent', () => {
  let component: AverageLockTimeComponent;
  let fixture: ComponentFixture<AverageLockTimeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AverageLockTimeComponent]
    });
    fixture = TestBed.createComponent(AverageLockTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
