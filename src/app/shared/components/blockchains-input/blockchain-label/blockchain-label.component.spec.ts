import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { IBlockchainShort } from '../types';

import { BlockchainLabelComponent } from './blockchain-label.component';

describe('BlockchainLabelComponent', () => {
  let component: BlockchainLabelComponent;
  let fixture: ComponentFixture<BlockchainLabelComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [BlockchainLabelComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockchainLabelComponent);
    component = fixture.componentInstance;
    component.blockchain = {
      name: BLOCKCHAIN_NAME.ETHEREUM_TESTNET,
      label: 'test',
      img: 'test'
    } as IBlockchainShort;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
