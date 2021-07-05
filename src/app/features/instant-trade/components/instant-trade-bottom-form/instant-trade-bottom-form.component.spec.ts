import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstantTradeBottomFormComponent } from './instant-trade-bottom-form.component';

describe('InstantTradeBottomFormComponent', () => {
  let component: InstantTradeBottomFormComponent;
  let fixture: ComponentFixture<InstantTradeBottomFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InstantTradeBottomFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InstantTradeBottomFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
