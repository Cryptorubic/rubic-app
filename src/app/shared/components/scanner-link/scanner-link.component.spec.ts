import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScannerLinkComponent } from './scanner-link.component';

describe('ScannerLinkComponent', () => {
  let component: ScannerLinkComponent;
  let fixture: ComponentFixture<ScannerLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScannerLinkComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScannerLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
