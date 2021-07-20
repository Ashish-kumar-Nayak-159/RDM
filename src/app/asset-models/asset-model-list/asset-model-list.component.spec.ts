import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetModelListComponent } from './asset-model-list.component';

describe('AssetModelListComponent', () => {
  let component: AssetModelListComponent;
  let fixture: ComponentFixture<AssetModelListComponent>;

  beforeEach(async(() => {
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
