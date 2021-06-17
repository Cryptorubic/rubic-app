import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetamaskErrorComponent } from './metamask-error.component';

describe('MetamaskErrorComponent', () => {
  let component: MetamaskErrorComponent;
  let fixture: ComponentFixture<MetamaskErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MetamaskErrorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MetamaskErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
