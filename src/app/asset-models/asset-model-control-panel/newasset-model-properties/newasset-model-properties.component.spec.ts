import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewassetModelPropertiesComponent } from './newasset-model-properties.component';

describe('NewassetModelPropertiesComponent', () => {
  let component: NewassetModelPropertiesComponent;
  let fixture: ComponentFixture<NewassetModelPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewassetModelPropertiesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewassetModelPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
