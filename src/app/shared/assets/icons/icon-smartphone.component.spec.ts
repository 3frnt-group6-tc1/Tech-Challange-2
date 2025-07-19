import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconSmartphoneComponent } from './icon-smartphone.component';

describe('IconSmartphoneComponent', () => {
  let component: IconSmartphoneComponent;
  let fixture: ComponentFixture<IconSmartphoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconSmartphoneComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IconSmartphoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
