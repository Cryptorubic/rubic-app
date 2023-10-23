import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AverageAprComponent } from './average-apr.component';

describe('AverageAprComponent', () => {
  let component: AverageAprComponent;
  let fixture: ComponentFixture<AverageAprComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AverageAprComponent]
    });
    fixture = TestBed.createComponent(AverageAprComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
