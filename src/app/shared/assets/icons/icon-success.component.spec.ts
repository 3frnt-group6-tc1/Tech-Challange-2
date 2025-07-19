import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconSuccessComponent } from './icon-success.component';

describe('IconSuccessComponent', () => {
  let component: IconSuccessComponent;
  let fixture: ComponentFixture<IconSuccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconSuccessComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IconSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
