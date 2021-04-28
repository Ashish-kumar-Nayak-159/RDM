import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtocolFieldsComponent } from './protocol-fields.component';

describe('ProtocolFieldsComponent', () => {
  let component: ProtocolFieldsComponent;
  let fixture: ComponentFixture<ProtocolFieldsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProtocolFieldsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProtocolFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
