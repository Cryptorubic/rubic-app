import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderPanelComponent } from './provider-panel.component';

describe('ProviderPanelComponent', () => {
  let component: ProviderPanelComponent;
  let fixture: ComponentFixture<ProviderPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProviderPanelComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProviderPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
