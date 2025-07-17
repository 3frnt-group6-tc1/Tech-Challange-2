import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ThemeService],
    });

    // Clear localStorage and reset DOM before each test
    localStorage.clear();
    document.documentElement.classList.remove('dark');

    service = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    // Clean up after each test
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('toggleDarkMode', () => {
    it('should enable dark mode when currently disabled', () => {
      // Ensure dark mode is disabled
      document.documentElement.classList.remove('dark');

      service.toggleDarkMode();

      expect(service.isDarkMode()).toBe(true);
      expect(localStorage.getItem('darkMode')).toBe('1');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should disable dark mode when currently enabled', () => {
      // Enable dark mode first
      document.documentElement.classList.add('dark');

      service.toggleDarkMode();

      expect(service.isDarkMode()).toBe(false);
      expect(localStorage.getItem('darkMode')).toBe('0');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('should toggle multiple times correctly', () => {
      // Start with light mode
      expect(service.isDarkMode()).toBe(false);

      // Toggle to dark
      service.toggleDarkMode();
      expect(service.isDarkMode()).toBe(true);

      // Toggle to light
      service.toggleDarkMode();
      expect(service.isDarkMode()).toBe(false);

      // Toggle to dark again
      service.toggleDarkMode();
      expect(service.isDarkMode()).toBe(true);
    });
  });

  describe('enableDarkMode', () => {
    it('should enable dark mode and update localStorage', () => {
      service.enableDarkMode();

      expect(service.isDarkMode()).toBe(true);
      expect(localStorage.getItem('darkMode')).toBe('1');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should work when dark mode is already enabled', () => {
      // Enable dark mode twice
      service.enableDarkMode();
      service.enableDarkMode();

      expect(service.isDarkMode()).toBe(true);
      expect(localStorage.getItem('darkMode')).toBe('1');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  describe('disableDarkMode', () => {
    it('should disable dark mode and update localStorage', () => {
      // Enable dark mode first
      service.enableDarkMode();
      expect(service.isDarkMode()).toBe(true);

      service.disableDarkMode();

      expect(service.isDarkMode()).toBe(false);
      expect(localStorage.getItem('darkMode')).toBe('0');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('should work when dark mode is already disabled', () => {
      // Disable dark mode twice
      service.disableDarkMode();
      service.disableDarkMode();

      expect(service.isDarkMode()).toBe(false);
      expect(localStorage.getItem('darkMode')).toBe('0');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  describe('isDarkMode', () => {
    it('should return true when dark mode is enabled', () => {
      document.documentElement.classList.add('dark');

      expect(service.isDarkMode()).toBe(true);
    });

    it('should return false when dark mode is disabled', () => {
      document.documentElement.classList.remove('dark');

      expect(service.isDarkMode()).toBe(false);
    });
  });

  describe('loadTheme', () => {
    it('should enable dark mode when localStorage has "1"', () => {
      localStorage.setItem('darkMode', '1');

      service.loadTheme();

      expect(service.isDarkMode()).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should disable dark mode when localStorage has "0"', () => {
      localStorage.setItem('darkMode', '0');

      service.loadTheme();

      expect(service.isDarkMode()).toBe(false);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('should use system preference when no localStorage value exists', () => {
      // Clear localStorage to ensure no stored value
      localStorage.clear();

      // Mock window.matchMedia to return dark theme preference
      const mockMatchMedia = jasmine.createSpy('matchMedia').and.returnValue({
        matches: true,
      });
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mockMatchMedia,
      });

      // Create a new service instance after mocking matchMedia
      const newService = new ThemeService();

      expect(mockMatchMedia).toHaveBeenCalledWith(
        '(prefers-color-scheme: dark)'
      );
      expect(newService.isDarkMode()).toBe(true);
    });

    it('should use light theme when system prefers light and no localStorage value', () => {
      // Clear localStorage to ensure no stored value
      localStorage.clear();

      // Mock window.matchMedia to return light theme preference
      const mockMatchMedia = jasmine.createSpy('matchMedia').and.returnValue({
        matches: false,
      });
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mockMatchMedia,
      });

      // Create a new service instance after mocking matchMedia
      const newService = new ThemeService();

      expect(mockMatchMedia).toHaveBeenCalledWith(
        '(prefers-color-scheme: dark)'
      );
      expect(newService.isDarkMode()).toBe(false);
    });

    it('should prioritize localStorage value over system preference', () => {
      // Set localStorage to light mode
      localStorage.setItem('darkMode', '0');

      // Mock system to prefer dark mode
      const mockMatchMedia = jasmine.createSpy('matchMedia').and.returnValue({
        matches: true,
      });
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mockMatchMedia,
      });

      service.loadTheme();

      // Should follow localStorage, not system preference
      expect(service.isDarkMode()).toBe(false);
      expect(mockMatchMedia).not.toHaveBeenCalled();
    });

    it('should handle invalid localStorage values', () => {
      localStorage.setItem('darkMode', 'invalid');

      // Mock system preference
      const mockMatchMedia = jasmine.createSpy('matchMedia').and.returnValue({
        matches: false,
      });
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mockMatchMedia,
      });

      // Create a new service instance after mocking matchMedia
      const newService = new ThemeService();

      // Should fall back to system preference
      expect(mockMatchMedia).toHaveBeenCalledWith(
        '(prefers-color-scheme: dark)'
      );
      expect(newService.isDarkMode()).toBe(false);
    });
  });

  describe('initialization', () => {
    it('should load theme on service creation', () => {
      localStorage.setItem('darkMode', '1');

      // Create a new service instance to test initialization
      const newService = new ThemeService();

      expect(newService.isDarkMode()).toBe(true);
    });

    it('should handle missing localStorage gracefully', () => {
      // Clear localStorage first
      localStorage.clear();

      // Mock localStorage to throw an error
      spyOn(Storage.prototype, 'getItem').and.throwError(
        'Storage not available'
      );

      // Mock window.matchMedia
      const mockMatchMedia = jasmine.createSpy('matchMedia').and.returnValue({
        matches: false,
      });
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mockMatchMedia,
      });

      // Should not throw an error and should create service successfully
      expect(() => {
        const newService = new ThemeService();
        expect(newService.isDarkMode()).toBe(false);
      }).not.toThrow();
    });
  });

  describe('persistence', () => {
    it('should persist dark mode preference across service instances', () => {
      // Enable dark mode
      service.enableDarkMode();
      expect(localStorage.getItem('darkMode')).toBe('1');

      // Create new service instance
      const newService = new ThemeService();
      expect(newService.isDarkMode()).toBe(true);
    });

    it('should persist light mode preference across service instances', () => {
      // Disable dark mode
      service.disableDarkMode();
      expect(localStorage.getItem('darkMode')).toBe('0');

      // Create new service instance
      const newService = new ThemeService();
      expect(newService.isDarkMode()).toBe(false);
    });

    it('should update localStorage when toggling', () => {
      // Start with light mode
      service.disableDarkMode();
      expect(localStorage.getItem('darkMode')).toBe('0');

      // Toggle to dark mode
      service.toggleDarkMode();
      expect(localStorage.getItem('darkMode')).toBe('1');

      // Toggle back to light mode
      service.toggleDarkMode();
      expect(localStorage.getItem('darkMode')).toBe('0');
    });

    it('should handle localStorage errors gracefully during operations', () => {
      // Mock localStorage.setItem to throw an error
      spyOn(Storage.prototype, 'setItem').and.throwError(
        'Storage not available'
      );

      // These operations should not throw errors
      expect(() => service.enableDarkMode()).not.toThrow();
      expect(() => service.disableDarkMode()).not.toThrow();
      expect(() => service.toggleDarkMode()).not.toThrow();

      // DOM manipulation should still work
      service.enableDarkMode();
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  describe('DOM manipulation', () => {
    it('should add dark class to documentElement when enabling', () => {
      service.enableDarkMode();

      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should remove dark class from documentElement when disabling', () => {
      // Add class first
      document.documentElement.classList.add('dark');

      service.disableDarkMode();

      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('should not affect other classes on documentElement', () => {
      // Add other classes
      document.documentElement.classList.add('test-class', 'another-class');

      service.enableDarkMode();

      expect(document.documentElement.classList.contains('test-class')).toBe(
        true
      );
      expect(document.documentElement.classList.contains('another-class')).toBe(
        true
      );
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      service.disableDarkMode();

      expect(document.documentElement.classList.contains('test-class')).toBe(
        true
      );
      expect(document.documentElement.classList.contains('another-class')).toBe(
        true
      );
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });
});
