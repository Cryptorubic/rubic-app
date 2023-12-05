import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LockedRbcInDollarsComponent } from './locked-rbc-in-dollars.component';

describe('LockedRbcInDollarsComponent', () => {
  let component: LockedRbcInDollarsComponent;
  let fixture: ComponentFixture<LockedRbcInDollarsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LockedRbcInDollarsComponent]
    });
    fixture = TestBed.createComponent(LockedRbcInDollarsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
