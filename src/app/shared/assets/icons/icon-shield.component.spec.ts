import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconShieldComponent } from './icon-shield.component';

describe('IconShieldComponent', () => {
  let component: IconShieldComponent;
  let fixture: ComponentFixture<IconShieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconShieldComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IconShieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
