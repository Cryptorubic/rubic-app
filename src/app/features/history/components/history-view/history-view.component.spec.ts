import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryViewComponent } from './history-view.component';

describe('HistoryViewComponent', () => {
  let component: HistoryViewComponent;
  let fixture: ComponentFixture<HistoryViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HistoryViewComponent]
    });
    fixture = TestBed.createComponent(HistoryViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
