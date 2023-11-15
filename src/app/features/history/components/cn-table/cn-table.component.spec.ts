import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CnTableComponent } from './cn-table.component';

describe('HistoryDesktopRowComponent', () => {
  let component: CnTableComponent;
  let fixture: ComponentFixture<CnTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CnTableComponent]
    });
    fixture = TestBed.createComponent(CnTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
