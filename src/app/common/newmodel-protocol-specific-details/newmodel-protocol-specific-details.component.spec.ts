import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewmodelProtocolSpecificDetailsComponent } from './newmodel-protocol-specific-details.component';

describe('NewmodelProtocolSpecificDetailsComponent', () => {
  let component: NewmodelProtocolSpecificDetailsComponent;
  let fixture: ComponentFixture<NewmodelProtocolSpecificDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewmodelProtocolSpecificDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewmodelProtocolSpecificDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
