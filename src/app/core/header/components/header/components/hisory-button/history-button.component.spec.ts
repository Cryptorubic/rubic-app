import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryButtonComponent } from './history-button.component';

describe('HisoryButtonComponent', () => {
  let component: HistoryButtonComponent;
  let fixture: ComponentFixture<HistoryButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HistoryButtonComponent]
    });
    fixture = TestBed.createComponent(HistoryButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
