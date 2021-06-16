import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsBridgeComponent } from './settings-bridge.component';

describe('SettingsBridgeComponent', () => {
  let component: SettingsBridgeComponent;
  let fixture: ComponentFixture<SettingsBridgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingsBridgeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsBridgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
