import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewdataTypeFiedsComponent } from './newdata-type-fieds.component';

describe('NewdataTypeFiedsComponent', () => {
  let component: NewdataTypeFiedsComponent;
  let fixture: ComponentFixture<NewdataTypeFiedsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewdataTypeFiedsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewdataTypeFiedsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
