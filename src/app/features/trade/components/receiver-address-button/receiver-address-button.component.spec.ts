import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiverAddressButtonComponent } from './receiver-address-button.component';

describe('ReceiverAddressButtonComponent', () => {
  let component: ReceiverAddressButtonComponent;
  let fixture: ComponentFixture<ReceiverAddressButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReceiverAddressButtonComponent]
    });
    fixture = TestBed.createComponent(ReceiverAddressButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
