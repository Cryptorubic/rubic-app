import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorDisclaimerComponent } from './error-disclaimer.component';

describe('WarningLabelComponent', () => {
  let component: ErrorDisclaimerComponent;
  let fixture: ComponentFixture<ErrorDisclaimerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ErrorDisclaimerComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorDisclaimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
