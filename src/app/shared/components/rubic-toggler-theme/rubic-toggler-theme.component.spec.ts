import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RubicTogglerThemeComponent } from './rubic-toggler-theme.component';

describe('RubicTogglerThemeComponent', () => {
  let component: RubicTogglerThemeComponent;
  let fixture: ComponentFixture<RubicTogglerThemeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RubicTogglerThemeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RubicTogglerThemeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
