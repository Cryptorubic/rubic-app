import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsItComponent } from 'src/app/features/swaps/components/settings-it/settings-it.component';

describe('SettingsComponent', () => {
  let component: SettingsItComponent;
  let fixture: ComponentFixture<SettingsItComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SettingsItComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsItComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
