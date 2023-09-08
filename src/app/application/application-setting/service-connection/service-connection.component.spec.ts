import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceConnectionComponent } from './service-connection.component';

describe('ServiceConnectionComponent', () => {
  let component: ServiceConnectionComponent;
  let fixture: ComponentFixture<ServiceConnectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServiceConnectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceConnectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
