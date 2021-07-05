import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RubicLanguageSelectComponent } from './rubic-language-select.component';

describe('RubicLanguageSelectComponent', () => {
  let component: RubicLanguageSelectComponent;
  let fixture: ComponentFixture<RubicLanguageSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RubicLanguageSelectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RubicLanguageSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
