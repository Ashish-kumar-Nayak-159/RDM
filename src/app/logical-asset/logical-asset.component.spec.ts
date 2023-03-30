import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogicalAssetComponent } from './logical-asset.component';

describe('LogicalAssetComponent', () => {
  let component: LogicalAssetComponent;
  let fixture: ComponentFixture<LogicalAssetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LogicalAssetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LogicalAssetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
