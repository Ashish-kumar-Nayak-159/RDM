import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AssetModelListComponent } from './asset-model-list.component';

describe('AssetModelListComponent', () => {
  let component: AssetModelListComponent;
  let fixture: ComponentFixture<AssetModelListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetModelListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetModelListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
