import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuccessSwapInfoComponent } from './success-swap-info.component';

describe('SuccessSwapInfoComponent', () => {
  let component: SuccessSwapInfoComponent;
  let fixture: ComponentFixture<SuccessSwapInfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SuccessSwapInfoComponent]
    });
    fixture = TestBed.createComponent(SuccessSwapInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
