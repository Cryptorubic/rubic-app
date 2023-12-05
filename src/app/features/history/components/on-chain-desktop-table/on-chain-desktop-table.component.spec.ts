import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnChainDesktopTableComponent } from './on-chain-desktop-table.component';

describe('HistoryDesktopRowComponent', () => {
  let component: OnChainDesktopTableComponent;
  let fixture: ComponentFixture<OnChainDesktopTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OnChainDesktopTableComponent]
    });
    fixture = TestBed.createComponent(OnChainDesktopTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
