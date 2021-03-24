import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstantTradesFormComponent } from './instant-trades-form.component';

describe('InstantTradesFormComponent', () => {
  let component: InstantTradesFormComponent;
  let fixture: ComponentFixture<InstantTradesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InstantTradesFormComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InstantTradesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
