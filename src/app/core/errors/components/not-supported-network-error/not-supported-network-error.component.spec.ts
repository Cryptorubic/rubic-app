import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotSupportedNetworkErrorComponent } from './not-supported-network-error.component';

describe('NotSupportedNetworkErrorComponent', () => {
  let component: NotSupportedNetworkErrorComponent;
  let fixture: ComponentFixture<NotSupportedNetworkErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotSupportedNetworkErrorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NotSupportedNetworkErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
