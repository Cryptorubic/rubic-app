import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CnPreviewSwapComponent } from './cn-preview-swap.component';

describe('PreviewSwapComponent', () => {
  let component: CnPreviewSwapComponent;
  let fixture: ComponentFixture<CnPreviewSwapComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CnPreviewSwapComponent]
    });
    fixture = TestBed.createComponent(CnPreviewSwapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
