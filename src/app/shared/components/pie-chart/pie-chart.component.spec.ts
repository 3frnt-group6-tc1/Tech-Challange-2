import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PieChartComponent } from './pie-chart.component';

describe('PieChartComponent', () => {
  let component: PieChartComponent;
  let fixture: ComponentFixture<PieChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PieChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PieChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('totalTransactions', () => {
    it('should return sum of entries and exits', () => {
      component.totalEntries = 100;
      component.totalExits = 50;
      expect(component.totalTransactions).toBe(150);
    });

    it('should return 0 when both entries and exits are 0', () => {
      component.totalEntries = 0;
      component.totalExits = 0;
      expect(component.totalTransactions).toBe(0);
    });
  });

  describe('entriesPercentage', () => {
    it('should calculate correct percentage', () => {
      component.totalEntries = 75;
      component.totalExits = 25;
      expect(component.entriesPercentage).toBe(75);
    });

    it('should return 0 when total transactions is 0', () => {
      component.totalEntries = 0;
      component.totalExits = 0;
      expect(component.entriesPercentage).toBe(0);
    });

    it('should return 100 when only entries exist', () => {
      component.totalEntries = 100;
      component.totalExits = 0;
      expect(component.entriesPercentage).toBe(100);
    });
  });

  describe('exitsPercentage', () => {
    it('should calculate correct percentage', () => {
      component.totalEntries = 25;
      component.totalExits = 75;
      expect(component.exitsPercentage).toBe(75);
    });

    it('should return 0 when total transactions is 0', () => {
      component.totalEntries = 0;
      component.totalExits = 0;
      expect(component.exitsPercentage).toBe(0);
    });

    it('should return 100 when only exits exist', () => {
      component.totalEntries = 0;
      component.totalExits = 100;
      expect(component.exitsPercentage).toBe(100);
    });
  });

  describe('entriesPath', () => {
    it('should return empty string when total transactions is 0', () => {
      component.totalEntries = 0;
      component.totalExits = 0;
      expect(component.entriesPath).toBe('');
    });

    it('should return valid SVG path when entries exist', () => {
      component.totalEntries = 50;
      component.totalExits = 50;
      const path = component.entriesPath;
      expect(path).toContain('M');
      expect(path).toContain('A');
      expect(path).toContain('Z');
    });

    it('should return full circle path when only entries exist', () => {
      component.totalEntries = 100;
      component.totalExits = 0;
      const path = component.entriesPath;
      expect(path).toContain('M 50 5 A 45 45 0 1 1');
    });
  });

  describe('exitsPath', () => {
    it('should return empty string when total transactions is 0', () => {
      component.totalEntries = 0;
      component.totalExits = 0;
      expect(component.exitsPath).toBe('');
    });

    it('should return valid SVG path when exits exist', () => {
      component.totalEntries = 50;
      component.totalExits = 50;
      const path = component.exitsPath;
      expect(path).toContain('M');
      expect(path).toContain('A');
      expect(path).toContain('Z');
    });

    it('should return full circle path when only exits exist', () => {
      component.totalEntries = 0;
      component.totalExits = 100;
      const path = component.exitsPath;
      expect(path).toContain('M 50 5 A 45 45 0 1 1');
    });
  });

  describe('formatCurrency', () => {
    it('should format positive numbers as Brazilian currency', () => {
      const result = component.formatCurrency(1000);
      const expected = result
        .replace(/\s/g, '')
        .replace(
          /[\u00A0\u1680\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]/g,
          ''
        );
      const actual = 'R$1.000,00'.replace(/\s/g, '');
      expect(expected).toBe(actual);
    });

    it('should format zero as Brazilian currency', () => {
      const result = component.formatCurrency(0);
      const expected = result
        .replace(/\s/g, '')
        .replace(
          /[\u00A0\u1680\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]/g,
          ''
        );
      const actual = 'R$0,00'.replace(/\s/g, '');
      expect(expected).toBe(actual);
    });

    it('should format decimal numbers correctly', () => {
      const result = component.formatCurrency(1234.56);
      const expected = result
        .replace(/\s/g, '')
        .replace(
          /[\u00A0\u1680\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]/g,
          ''
        );
      const actual = 'R$1.234,56'.replace(/\s/g, '');
      expect(expected).toBe(actual);
    });

    it('should format large numbers correctly', () => {
      const result = component.formatCurrency(1000000);
      const expected = result
        .replace(/\s/g, '')
        .replace(
          /[\u00A0\u1680\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]/g,
          ''
        );
      const actual = 'R$1.000.000,00'.replace(/\s/g, '');
      expect(expected).toBe(actual);
    });
  });

  describe('createPath', () => {
    it('should handle full circle correctly', () => {
      const path = (component as any).createPath(0, 1);
      expect(path).toContain('M 50 5 A 45 45 0 1 1');
    });

    it('should handle half circle correctly', () => {
      const path = (component as any).createPath(0, 0.5);
      expect(path).toContain('M 50 50');
      expect(path).toContain('A 45 45 0 0 1');
    });

    it('should handle quarter circle correctly', () => {
      const path = (component as any).createPath(0, 0.25);
      expect(path).toContain('M 50 50');
      expect(path).toContain('A 45 45 0 0 1');
    });
  });
});
