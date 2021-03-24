import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BridgeComponent } from './bridge.component';

describe('BridgeComponent', () => {
  let component: BridgeComponent;
  let fixture: ComponentFixture<BridgeComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [BridgeComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(BridgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
