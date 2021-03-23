import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstantTradesTableComponent } from './instant-trades-table.component';

describe('InstantTradesTableComponent', () => {
  let component: InstantTradesTableComponent;
  let fixture: ComponentFixture<InstantTradesTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InstantTradesTableComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InstantTradesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
