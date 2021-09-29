import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AssetMtbfComponent } from './asset-mtbf.component';

describe('AssetMtbfComponent', () => {
  let component: AssetMtbfComponent;
  let fixture: ComponentFixture<AssetMtbfComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetMtbfComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetMtbfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
