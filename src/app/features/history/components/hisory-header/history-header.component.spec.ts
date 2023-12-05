import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryHeaderComponent } from './history-header.component';

describe('HisoryHeaderComponent', () => {
  let component: HistoryHeaderComponent;
  let fixture: ComponentFixture<HistoryHeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HistoryHeaderComponent]
    });
    fixture = TestBed.createComponent(HistoryHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
