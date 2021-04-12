import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BridgeService } from '../../services/bridge.service';
import { RubicBridgeService } from '../../services/rubic-bridge-service/rubic-bridge.service';

import { BridgeTableComponent } from './bridge-table.component';

describe('BridgeTableComponent', () => {
  let component: BridgeTableComponent;
  let fixture: ComponentFixture<BridgeTableComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientModule],
        providers: [BridgeService, RubicBridgeService],
        declarations: [BridgeTableComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(BridgeTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
