import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BridgeBottomFormComponent } from './bridge-bottom-form.component';

describe('BridgeBottomFormComponent', () => {
  let component: BridgeBottomFormComponent;
  let fixture: ComponentFixture<BridgeBottomFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BridgeBottomFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BridgeBottomFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
