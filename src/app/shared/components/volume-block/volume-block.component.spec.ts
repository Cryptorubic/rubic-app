import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ContentLoaderService } from 'src/app/core/services/content-loader/content-loader.service';

import { VolumeBlockComponent } from './volume-block.component';

class MockService {
  volumeContent = [];
}

describe('VolumeBlockComponent', () => {
  let component: VolumeBlockComponent;
  let fixture: ComponentFixture<VolumeBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientModule, TranslateModule.forRoot()],
      declarations: [VolumeBlockComponent],
      providers: [{ provide: ContentLoaderService, useValue: MockService }]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VolumeBlockComponent);
    component = fixture.componentInstance;
    component.volume = { instantTradesVolume: '', bridgeVolume: '' };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

export default interface VolumeContent {
  instantTradesVolume: string;
  bridgeVolume: string;
}
