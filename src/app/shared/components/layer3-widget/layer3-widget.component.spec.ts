import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Layer3WidgetComponent } from './layer3-widget.component';

describe('Layer3WidgetComponent', () => {
  let component: Layer3WidgetComponent;
  let fixture: ComponentFixture<Layer3WidgetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Layer3WidgetComponent]
    });
    fixture = TestBed.createComponent(Layer3WidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
