import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddLogicalAssetComponent } from './add-logical-asset.component';

describe('AddLogicalAssetComponent', () => {
  let component: AddLogicalAssetComponent;
  let fixture: ComponentFixture<AddLogicalAssetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddLogicalAssetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddLogicalAssetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
