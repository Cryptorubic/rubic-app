import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwapFormPageComponent } from './swap-form-page.component';

describe('SwapFormPageComponent', () => {
  let component: SwapFormPageComponent;
  let fixture: ComponentFixture<SwapFormPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SwapFormPageComponent]
    });
    fixture = TestBed.createComponent(SwapFormPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
