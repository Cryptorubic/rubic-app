import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';

import { HeaderLanguageDropdownComponent } from './header-language-dropdown.component';

describe('HeaderLanguageDropdownComponent', () => {
  let component: HeaderLanguageDropdownComponent;
  let fixture: ComponentFixture<HeaderLanguageDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
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
