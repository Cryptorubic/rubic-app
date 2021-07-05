import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RubicButtonComponent } from './rubic-button.component';

describe('RubicButtonComponent', () => {
  let component: RubicButtonComponent;
  let fixture: ComponentFixture<RubicButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RubicButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RubicButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
