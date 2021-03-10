import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WarningLabelComponent } from './warning-label.component';

describe('WarningLabelComponent', () => {
  let component: WarningLabelComponent;
  let fixture: ComponentFixture<WarningLabelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WarningLabelComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WarningLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
