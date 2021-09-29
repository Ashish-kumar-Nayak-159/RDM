import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AssetModelLayoutComponent } from './asset-model-layout.component';

describe('AssetModelLayoutComponent', () => {
  let component: AssetModelLayoutComponent;
  let fixture: ComponentFixture<AssetModelLayoutComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetModelLayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetModelLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
