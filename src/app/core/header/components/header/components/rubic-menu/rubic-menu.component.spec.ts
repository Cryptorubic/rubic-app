import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RubicMenuComponent } from './rubic-menu.component';

describe('RubicMenuComponent', () => {
  let component: RubicMenuComponent;
  let fixture: ComponentFixture<RubicMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RubicMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RubicMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
