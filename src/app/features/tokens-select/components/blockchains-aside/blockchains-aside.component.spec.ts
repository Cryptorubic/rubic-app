import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockchainsAsideComponent } from './blockchains-aside.component';

describe('BlockchainsAsideComponent', () => {
  let component: BlockchainsAsideComponent;
  let fixture: ComponentFixture<BlockchainsAsideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BlockchainsAsideComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockchainsAsideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
