import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BridgeSuccessComponent } from './bridge-success.component';

describe('BridgeSuccessComponent', () => {
  let component: BridgeSuccessComponent;
  let fixture: ComponentFixture<BridgeSuccessComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [BridgeSuccessComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BridgeSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
