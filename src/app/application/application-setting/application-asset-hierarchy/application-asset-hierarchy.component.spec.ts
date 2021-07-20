import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationAssetHierarchyComponent } from './application-asset-hierarchy.component';

describe('ApplicationAssetHierarchyComponent', () => {
  let component: ApplicationAssetHierarchyComponent;
  let fixture: ComponentFixture<ApplicationAssetHierarchyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplicationAssetHierarchyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationAssetHierarchyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
