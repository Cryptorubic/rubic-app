import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TradesPageComponent } from './trades-page.component';

describe('TradesPageComponent', () => {
  let component: TradesPageComponent;
  let fixture: ComponentFixture<TradesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TradesPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TradesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
