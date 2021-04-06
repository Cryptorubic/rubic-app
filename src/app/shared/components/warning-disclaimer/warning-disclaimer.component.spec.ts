import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarningDisclaimerComponent } from './warning-disclaimer.component';

describe('WarningDisclaimerComponent', () => {
  let component: WarningDisclaimerComponent;
  let fixture: ComponentFixture<WarningDisclaimerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WarningDisclaimerComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WarningDisclaimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
