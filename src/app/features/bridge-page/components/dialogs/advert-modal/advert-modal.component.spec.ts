import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CookieService } from 'ngx-cookie-service';

import { AdvertModalComponent } from './advert-modal.component';

describe('AdvertModalComponent', () => {
  let component: AdvertModalComponent;
  let fixture: ComponentFixture<AdvertModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatDialogModule, BrowserAnimationsModule],
      declarations: [AdvertModalComponent],
      providers: [CookieService]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvertModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
