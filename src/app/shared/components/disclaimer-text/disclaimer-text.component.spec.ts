import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisclaimerTextComponent } from './disclaimer-text.component';

describe('DisclaimerTextComponent', () => {
  let component: DisclaimerTextComponent;
  let fixture: ComponentFixture<DisclaimerTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DisclaimerTextComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DisclaimerTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
