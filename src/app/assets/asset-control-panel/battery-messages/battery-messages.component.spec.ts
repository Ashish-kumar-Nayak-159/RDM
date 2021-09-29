import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BatteryMessagesComponent } from './battery-messages.component';

describe('BatteryMessagesComponent', () => {
  let component: BatteryMessagesComponent;
  let fixture: ComponentFixture<BatteryMessagesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BatteryMessagesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BatteryMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
