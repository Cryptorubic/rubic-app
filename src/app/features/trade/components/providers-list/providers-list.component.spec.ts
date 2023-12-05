import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvidersListComponent } from './providers-list.component';

describe('ProvidersListDesktopComponent', () => {
  let component: ProvidersListComponent;
  let fixture: ComponentFixture<ProvidersListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProvidersListComponent]
    });
    fixture = TestBed.createComponent(ProvidersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
