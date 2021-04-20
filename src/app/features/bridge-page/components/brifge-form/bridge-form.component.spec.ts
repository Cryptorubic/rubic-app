import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BridgeService } from '../../services/bridge.service';
import { RubicBridgeService } from '../../services/rubic-bridge-service/rubic-bridge.service';
import { BridgeFormComponent } from './bridge-form.component';
import { SharedModule } from '../../../../shared/shared.module';
import { backendTestTokens } from '../../../../../test/tokens/backend-tokens';

describe('BridgeFormComponent', () => {
  let component: BridgeFormComponent;
  let fixture: ComponentFixture<BridgeFormComponent>;
  let httpMock: HttpTestingController;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [
          HttpClientModule,
          MatDialogModule,
          RouterTestingModule,
          SharedModule,
          TranslateModule.forRoot(),
          BrowserAnimationsModule,
          HttpClientTestingModule
        ],
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

      httpMock = TestBed.get(HttpTestingController);
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(BridgeFormComponent);
    component = fixture.componentInstance;
    (component as any).queryParamsService.setupParams({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();

    const tokensRequest = httpMock.expectOne('/api/v1/coingecko_tokens/');
    tokensRequest.flush(backendTestTokens);
    httpMock.expectOne('https://api.binance.org/bridge/api/v2/tokens');

    httpMock.verify();
  });
});
