import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetModelLayoutComponent } from './asset-model-layout.component';

describe('AssetModelLayoutComponent', () => {
  let component: AssetModelLayoutComponent;
  let fixture: ComponentFixture<AssetModelLayoutComponent>;

  beforeEach(async(() => {
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
