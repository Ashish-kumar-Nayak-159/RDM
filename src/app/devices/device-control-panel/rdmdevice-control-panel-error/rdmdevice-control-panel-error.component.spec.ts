import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RDMDeviceControlPanelErrorComponent } from './rdmdevice-control-panel-error.component';

describe('RDMDeviceControlPanelErrorComponent', () => {
  let component: RDMDeviceControlPanelErrorComponent;
  let fixture: ComponentFixture<RDMDeviceControlPanelErrorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RDMDeviceControlPanelErrorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RDMDeviceControlPanelErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
