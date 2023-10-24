import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LockedRbcComponent } from './locked-rbc.component';

describe('LockedRbcComponent', () => {
  let component: LockedRbcComponent;
  let fixture: ComponentFixture<LockedRbcComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LockedRbcComponent]
    });
    fixture = TestBed.createComponent(LockedRbcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
