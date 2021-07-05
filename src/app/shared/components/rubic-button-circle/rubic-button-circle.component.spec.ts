import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RubicButtonCircleComponent } from './rubic-button-circle.component';

describe('RubicButtonCircleComponent', () => {
  let component: RubicButtonCircleComponent;
  let fixture: ComponentFixture<RubicButtonCircleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RubicButtonCircleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RubicButtonCircleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
