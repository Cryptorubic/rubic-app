import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BridgeService } from '../../services/bridge.service';
import { RubicBridgeService } from '../../services/rubic-bridge-service/rubic-bridge.service';

import { BridgeFormComponent } from './bridge-form.component';

describe('BridgeFormComponent', () => {
  let component: BridgeFormComponent;
  let fixture: ComponentFixture<BridgeFormComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientModule, MatDialogModule],
        providers: [
          BridgeService,
          RubicBridgeService,
          {
            provide: MatDialogRef,
            useValue: {}
          }
        ],
        declarations: [BridgeFormComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(BridgeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
