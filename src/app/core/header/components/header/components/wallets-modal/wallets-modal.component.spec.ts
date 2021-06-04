import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletsModalComponent } from './wallets-modal.component';

describe('WalletsModalComponent', () => {
  let component: WalletsModalComponent;
  let fixture: ComponentFixture<WalletsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WalletsModalComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
