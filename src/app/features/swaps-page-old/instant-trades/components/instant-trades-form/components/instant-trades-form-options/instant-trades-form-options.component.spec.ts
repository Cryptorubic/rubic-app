import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstantTradesFormOptionsComponent } from './instant-trades-form-options.component';

describe('InstantTradesFormOptionsComponent', () => {
  let component: InstantTradesFormOptionsComponent;
  let fixture: ComponentFixture<InstantTradesFormOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InstantTradesFormOptionsComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InstantTradesFormOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
