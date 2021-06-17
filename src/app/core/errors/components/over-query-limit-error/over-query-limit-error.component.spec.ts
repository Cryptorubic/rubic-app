import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverQueryLimitErrorComponent } from './over-query-limit-error.component';

describe('OverQueryLimitErrorComponent', () => {
  let component: OverQueryLimitErrorComponent;
  let fixture: ComponentFixture<OverQueryLimitErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OverQueryLimitErrorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OverQueryLimitErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
