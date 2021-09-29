import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DataTypeFiedsComponent } from './data-type-fieds.component';

describe('DataTypeFiedsComponent', () => {
  let component: DataTypeFiedsComponent;
  let fixture: ComponentFixture<DataTypeFiedsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DataTypeFiedsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataTypeFiedsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
