import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconInvestmentComponent } from './icon-investment.component';

describe('IconInvestmentComponent', () => {
  let component: IconInvestmentComponent;
  let fixture: ComponentFixture<IconInvestmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconInvestmentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IconInvestmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
