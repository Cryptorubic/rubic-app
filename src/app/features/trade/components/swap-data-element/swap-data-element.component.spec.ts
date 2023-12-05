import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwapDataElementComponent } from './swap-data-element.component';

describe('SwapDataElementComponent', () => {
  let component: SwapDataElementComponent;
  let fixture: ComponentFixture<SwapDataElementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SwapDataElementComponent]
    });
    fixture = TestBed.createComponent(SwapDataElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
