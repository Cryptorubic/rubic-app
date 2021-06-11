import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RubicSwitcherComponent } from './rubic-switcher.component';

describe('RubicSwitcherComponent', () => {
  let component: RubicSwitcherComponent;
  let fixture: ComponentFixture<RubicSwitcherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RubicSwitcherComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RubicSwitcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
