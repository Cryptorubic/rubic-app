import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderElementComponent } from './provider-element.component';

describe('ProviderElementComponent', () => {
  let component: ProviderElementComponent;
  let fixture: ComponentFixture<ProviderElementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProviderElementComponent]
    });
    fixture = TestBed.createComponent(ProviderElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
