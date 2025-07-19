import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconZapComponent } from './icon-zap.component';

describe('IconZapComponent', () => {
  let component: IconZapComponent;
  let fixture: ComponentFixture<IconZapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconZapComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IconZapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
