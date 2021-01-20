import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BridgeSuccessComponent } from './bridge-success.component';

describe('BridgeSuccessComponent', () => {
  let component: BridgeSuccessComponent;
  let fixture: ComponentFixture<BridgeSuccessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BridgeSuccessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BridgeSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
