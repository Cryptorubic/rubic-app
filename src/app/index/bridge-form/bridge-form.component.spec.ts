import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BridgeFormComponent } from './bridge-form.component';

describe('BridgeFormComponent', () => {
  let component: BridgeFormComponent;
  let fixture: ComponentFixture<BridgeFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BridgeFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BridgeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
