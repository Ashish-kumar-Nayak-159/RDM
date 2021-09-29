import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ApplicationMetadataComponent } from './application-metadata.component';

describe('ApplicationMetadataComponent', () => {
  let component: ApplicationMetadataComponent;
  let fixture: ComponentFixture<ApplicationMetadataComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplicationMetadataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationMetadataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
