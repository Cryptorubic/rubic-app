import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsElementComponent } from './settings-element.component';

describe('SettingsElementComponent', () => {
  let component: SettingsElementComponent;
  let fixture: ComponentFixture<SettingsElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SettingsElementComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
