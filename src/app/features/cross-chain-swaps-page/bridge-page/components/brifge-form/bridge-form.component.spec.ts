import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SharedModule } from 'src/app/shared/shared.module';
import { backendTestTokens } from 'src/test/tokens/backend-tokens';
import { environment } from 'src/environments/environment';
import { BridgeFormComponent } from './bridge-form.component';
import { BridgeService } from '../../services/bridge.service';

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
          {
            provide: MatDialogRef,
            useValue: {}
          }
        ],
        declarations: [BridgeFormComponent]
      }).compileComponents();

      httpMock = TestBed.inject(HttpTestingController);
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

    const tokensRequest = httpMock.expectOne(`${environment.apiBaseUrl}/tokens/`);
    tokensRequest.flush(backendTestTokens);
    httpMock.expectOne('https://api.binance.org/bridge/api/v2/tokens');

    httpMock.verify();
  });
});
