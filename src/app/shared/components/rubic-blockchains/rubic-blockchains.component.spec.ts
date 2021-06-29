import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RubicBlockchainsComponent } from './rubic-blockchains.component';

describe('RubicBlockchainsComponent', () => {
  let component: RubicBlockchainsComponent;
  let fixture: ComponentFixture<RubicBlockchainsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RubicBlockchainsComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RubicBlockchainsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
