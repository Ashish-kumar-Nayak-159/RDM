import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetMttrComponent } from './asset-mttr.component';

describe('AssetMttrComponent', () => {
  let component: AssetMttrComponent;
  let fixture: ComponentFixture<AssetMttrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetMttrComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetMttrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
