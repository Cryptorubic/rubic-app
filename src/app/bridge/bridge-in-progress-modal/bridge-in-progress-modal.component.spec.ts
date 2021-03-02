import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BridgeInProgressModalComponent } from './bridge-in-progress-modal.component';

describe('BridgeInProgressModalComponent', () => {
  let component: BridgeInProgressModalComponent;
  let fixture: ComponentFixture<BridgeInProgressModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [BridgeInProgressModalComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BridgeInProgressModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
