import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrossChainSwapsComponent } from './cross-chain-swaps.component';

describe('CrossChainSwapsComponent', () => {
  let component: CrossChainSwapsComponent;
  let fixture: ComponentFixture<CrossChainSwapsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CrossChainSwapsComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrossChainSwapsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
