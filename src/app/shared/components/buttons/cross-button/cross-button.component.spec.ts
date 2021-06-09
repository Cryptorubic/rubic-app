import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrossButtonComponent } from './cross-button.component';

describe('CrossButtonComponent', () => {
  let component: CrossButtonComponent;
  let fixture: ComponentFixture<CrossButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrossButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrossButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
