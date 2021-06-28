import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RubicRefreshButtonComponent } from './rubic-refresh-button.component';

describe('RubicRefreshButtonComponent', () => {
  let component: RubicRefreshButtonComponent;
  let fixture: ComponentFixture<RubicRefreshButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RubicRefreshButtonComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RubicRefreshButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
