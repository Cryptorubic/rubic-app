import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RubicHeaderComponent } from './rubic-header.component';

describe('RubicHeaderComponent', () => {
  let component: RubicHeaderComponent;
  let fixture: ComponentFixture<RubicHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RubicHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RubicHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
