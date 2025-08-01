import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconPieChartComponent } from './icon-pie-chart.component';

describe('IconPieChartComponent', () => {
  let component: IconPieChartComponent;
  let fixture: ComponentFixture<IconPieChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconPieChartComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IconPieChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
