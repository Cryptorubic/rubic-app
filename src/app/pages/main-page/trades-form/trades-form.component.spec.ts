import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TradesFormComponent } from './trades-form.component';

describe('TradesFormComponent', () => {
  let component: TradesFormComponent;
  let fixture: ComponentFixture<TradesFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TradesFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TradesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
