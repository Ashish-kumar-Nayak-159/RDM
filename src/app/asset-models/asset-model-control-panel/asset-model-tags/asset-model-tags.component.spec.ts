import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetModelTagsComponent } from './asset-model-tags.component';

describe('AssetModelTagsComponent', () => {
  let component: AssetModelTagsComponent;
  let fixture: ComponentFixture<AssetModelTagsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetModelTagsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetModelTagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
