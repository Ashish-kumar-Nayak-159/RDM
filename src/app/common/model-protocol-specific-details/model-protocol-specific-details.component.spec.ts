import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ModelProtocolSpecificDetailsComponent } from './model-protocol-specific-details.component';

describe('ModelProtocolSpecificDetailsComponent', () => {
  let component: ModelProtocolSpecificDetailsComponent;
  let fixture: ComponentFixture<ModelProtocolSpecificDetailsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ModelProtocolSpecificDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelProtocolSpecificDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
