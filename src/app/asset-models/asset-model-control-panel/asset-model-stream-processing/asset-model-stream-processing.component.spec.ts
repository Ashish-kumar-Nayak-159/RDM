import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AssetModelStreamProcessingComponent } from './asset-model-stream-processing.component';

describe('AssetModelStreamProcessingComponent', () => {
  let component: AssetModelStreamProcessingComponent;
  let fixture: ComponentFixture<AssetModelStreamProcessingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetModelStreamProcessingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetModelStreamProcessingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
