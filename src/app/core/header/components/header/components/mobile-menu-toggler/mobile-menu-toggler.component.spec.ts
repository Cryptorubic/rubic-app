import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileMenuTogglerComponent } from './mobile-menu-toggler.component';

describe('MobileMenuTogglerComponent', () => {
  let component: MobileMenuTogglerComponent;
  let fixture: ComponentFixture<MobileMenuTogglerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MobileMenuTogglerComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileMenuTogglerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
