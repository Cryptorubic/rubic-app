import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BLOCKCHAIN_NAME } from '../../models/blockchain/BLOCKCHAIN_NAME';

import { BlockchainsInputComponent } from './blockchains-input.component';

describe('BlockchainsInputComponent', () => {
  let component: BlockchainsInputComponent;
  let fixture: ComponentFixture<BlockchainsInputComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [BlockchainsInputComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockchainsInputComponent);
    component = fixture.componentInstance;
    component.selectedBlockchain = { img: '' } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
