import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BlockchainSelectComponent } from './blockchain-select.component';
import { BLOCKCHAIN_NAME } from '../../models/blockchain/BLOCKCHAIN_NAME';
import { BridgeBlockchain } from '../../../features/cross-chain-swaps-page/bridge-page/models/BridgeBlockchain';

describe('BlockchainSelectComponent', () => {
  let component: BlockchainSelectComponent;
  let fixture: ComponentFixture<BlockchainSelectComponent>;
  const blockchains: BridgeBlockchain[] = [
    {
      key: BLOCKCHAIN_NAME.ETHEREUM,
      name: 'Ethereum',
      label: 'Ethereum',
      img: 'eth.png',
      baseUrl: 'https://etherscan.io',
      addressBaseUrl: 'https://etherscan.io/address/',
      scannerLabel: 'Etherscan'
    }
  ];
  const ethereumBlockchain: BridgeBlockchain = blockchains[0];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, MatFormFieldModule, MatSelectModule, BrowserAnimationsModule],
      declarations: [BlockchainSelectComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockchainSelectComponent);
    component = fixture.componentInstance;
    component.blockchains = blockchains;
    component.selectedBlockchain = ethereumBlockchain;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
