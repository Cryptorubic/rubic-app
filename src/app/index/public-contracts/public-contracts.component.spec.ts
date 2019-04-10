import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicContractsComponent } from './public-contracts.component';

describe('PublicContractsComponent', () => {
  let component: PublicContractsComponent;
  let fixture: ComponentFixture<PublicContractsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PublicContractsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicContractsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
