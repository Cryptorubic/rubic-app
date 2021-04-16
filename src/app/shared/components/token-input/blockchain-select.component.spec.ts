import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockchainSelectComponent } from './blockchain-select.component';

describe('BlockchainSelectComponent', () => {
  let component: BlockchainSelectComponent;
  let fixture: ComponentFixture<BlockchainSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BlockchainSelectComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockchainSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
