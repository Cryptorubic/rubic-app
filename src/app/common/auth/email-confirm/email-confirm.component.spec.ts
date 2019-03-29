import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailConfirmComponent } from './email-confirm.component';

describe('EmailConfirmComponent', () => {
  let component: EmailConfirmComponent;
  let fixture: ComponentFixture<EmailConfirmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailConfirmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
