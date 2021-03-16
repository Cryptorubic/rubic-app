import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListingRequestPopupComponent } from './listing-request-popup.component';

describe('ListingRequestPopupComponent', () => {
  let component: ListingRequestPopupComponent;
  let fixture: ComponentFixture<ListingRequestPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListingRequestPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListingRequestPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
