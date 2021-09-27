import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataTypeFiedsComponent } from './data-type-fieds.component';

describe('DataTypeFiedsComponent', () => {
  let component: DataTypeFiedsComponent;
  let fixture: ComponentFixture<DataTypeFiedsComponent>;

  beforeEach(async(() => {
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
