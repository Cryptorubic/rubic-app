import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InstantTradesComponent } from './instant-trades.component';

describe('InstantTradesComponent', () => {
  let component: InstantTradesComponent;
  let fixture: ComponentFixture<InstantTradesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InstantTradesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InstantTradesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
