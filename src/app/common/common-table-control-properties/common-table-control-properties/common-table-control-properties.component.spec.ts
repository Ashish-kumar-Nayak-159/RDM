import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonTableControlPropertiesComponent } from './common-table-control-properties.component';

describe('CommonTableControlPropertiesComponent', () => {
  let component: CommonTableControlPropertiesComponent;
  let fixture: ComponentFixture<CommonTableControlPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommonTableControlPropertiesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonTableControlPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
