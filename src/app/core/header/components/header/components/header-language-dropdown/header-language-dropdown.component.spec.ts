import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { of, Subject } from 'rxjs';

import { HeaderLanguageDropdownComponent } from './header-language-dropdown.component';

describe('HeaderLanguageDropdownComponent', () => {
  let component: HeaderLanguageDropdownComponent;
  let fixture: ComponentFixture<HeaderLanguageDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), MatMenuModule],
      declarations: [HeaderLanguageDropdownComponent],
      providers: [CookieService]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderLanguageDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
