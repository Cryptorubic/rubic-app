import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvertModalComponent } from './advert-modal.component';

describe('LogoutConfirmModalComponent', () => {
  let component: AdvertModalComponent;
  let fixture: ComponentFixture<AdvertModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdvertModalComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvertModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
