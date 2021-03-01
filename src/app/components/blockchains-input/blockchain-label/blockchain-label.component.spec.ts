import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BlockchainLabelComponent } from './blockchain-label.component';

describe('BlockchainLabelComponent', () => {
  let component: BlockchainLabelComponent;
  let fixture: ComponentFixture<BlockchainLabelComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [BlockchainLabelComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockchainLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
