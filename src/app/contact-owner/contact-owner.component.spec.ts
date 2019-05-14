import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactOwnerComponent } from './contact-owner.component';

describe('ContactOwnerComponent', () => {
  let component: ContactOwnerComponent;
  let fixture: ComponentFixture<ContactOwnerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactOwnerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactOwnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
