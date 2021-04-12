import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScannerLinkPipe } from '../../pipes/scanner-link.pipe';

import { ScannerLinkComponent } from './scanner-link.component';

describe('ScannerLinkComponent', () => {
  let component: ScannerLinkComponent;
  let fixture: ComponentFixture<ScannerLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScannerLinkComponent, ScannerLinkPipe]
    }).compileComponents();
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
