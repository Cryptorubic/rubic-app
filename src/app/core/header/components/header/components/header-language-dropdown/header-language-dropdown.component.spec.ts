import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderLanguageDropdownComponent } from './header-language-dropdown.component';

describe('HeaderLanguageDropdownComponent', () => {
  let component: HeaderLanguageDropdownComponent;
  let fixture: ComponentFixture<HeaderLanguageDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HeaderLanguageDropdownComponent]
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
