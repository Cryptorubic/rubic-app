import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RubicFooterComponent } from 'src/app/core/rubic-footer/rubic-footer.component';

describe('RubicFooterComponent', () => {
  let component: RubicFooterComponent;
  let fixture: ComponentFixture<RubicFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RubicFooterComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RubicFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
