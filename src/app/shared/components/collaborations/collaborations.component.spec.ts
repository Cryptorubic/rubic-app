import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { ContentLoaderService } from 'src/app/core/services/content-loader/content-loader.service';

import { CollaborationsComponent } from './collaborations.component';

class MockService {
  collaborationsContent = [];
}

describe('CollaborationsComponent', () => {
  let component: CollaborationsComponent;
  let fixture: ComponentFixture<CollaborationsComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientModule, MatDialogModule, TranslateModule.forRoot()],
        providers: [{ provide: ContentLoaderService, useValue: MockService }],
        declarations: [CollaborationsComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(CollaborationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
