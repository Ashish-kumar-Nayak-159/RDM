import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AssetModelReferenceDocumentsComponent } from './asset-model-reference-documents.component';

describe('AssetModelReferenceDocumentsComponent', () => {
  let component: AssetModelReferenceDocumentsComponent;
  let fixture: ComponentFixture<AssetModelReferenceDocumentsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetModelReferenceDocumentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetModelReferenceDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
