import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrossChainDesktopTableComponent } from './cross-chain-desktop-table.component';

describe('HistoryDesktopRowComponent', () => {
  let component: CrossChainDesktopTableComponent;
  let fixture: ComponentFixture<CrossChainDesktopTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CrossChainDesktopTableComponent]
    });
    fixture = TestBed.createComponent(CrossChainDesktopTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
