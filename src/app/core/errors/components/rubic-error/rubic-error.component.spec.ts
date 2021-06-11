import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RubicErrorComponent } from './rubic-error.component';

describe('RubicErrorComponent', () => {
  let component: RubicErrorComponent;
  let fixture: ComponentFixture<RubicErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RubicErrorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RubicErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
