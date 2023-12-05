import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewSwapComponent } from './preview-swap.component';

describe('PreviewSwapComponent', () => {
  let component: PreviewSwapComponent;
  let fixture: ComponentFixture<PreviewSwapComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PreviewSwapComponent]
    });
    fixture = TestBed.createComponent(PreviewSwapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
