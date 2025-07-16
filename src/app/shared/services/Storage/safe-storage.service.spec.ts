import { TestBed } from '@angular/core/testing';
import { SafeStorageService } from './safe-storage.service';

describe('SafeStorageService', () => {
  let service: SafeStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SafeStorageService);

    // Clear storage before each test
    sessionStorage.clear();
    localStorage.clear();
  });

  afterEach(() => {
    // Clean up after each test
    sessionStorage.clear();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('safeStringify', () => {
    it('should stringify simple objects correctly', () => {
      const data = { name: 'João', age: 30 };
      const result = service.safeStringify(data);
      expect(result).toBe('{"name":"João","age":30}');
    });

    it('should handle accented characters correctly', () => {
      const data = { name: 'José María', city: 'São Paulo' };
      const result = service.safeStringify(data);
      const parsed = JSON.parse(result);
      expect(parsed.name).toBe('José María');
      expect(parsed.city).toBe('São Paulo');
    });
  });

  describe('safeParse', () => {
    it('should parse JSON strings correctly', () => {
      const jsonString = '{"name":"João","age":30}';
      const result = service.safeParse(jsonString);
      expect(result).toEqual({ name: 'João', age: 30 });
    });

    it('should return null for invalid JSON', () => {
      const invalidJson = '{ invalid json }';
      const result = service.safeParse(invalidJson);
      expect(result).toBeNull();
    });
  });

  describe('sessionStorage methods', () => {
    it('should set and get session items correctly', () => {
      const data = { name: 'João Silva', email: 'joao@test.com' };

      service.setSessionItem('test-key', data);
      const retrieved = service.getSessionItem('test-key');

      expect(retrieved).toEqual(data);
    });

    it('should remove session items correctly', () => {
      const data = { test: 'value' };

      service.setSessionItem('test-key', data);
      service.removeSessionItem('test-key');
      const retrieved = service.getSessionItem('test-key');

      expect(retrieved).toBeNull();
    });
  });

  describe('localStorage methods', () => {
    it('should set and get local items correctly', () => {
      const data = { name: 'João Silva', email: 'joao@test.com' };

      service.setLocalItem('test-key', data);
      const retrieved = service.getLocalItem('test-key');

      expect(retrieved).toEqual(data);
    });

    it('should remove local items correctly', () => {
      const data = { test: 'value' };

      service.setLocalItem('test-key', data);
      service.removeLocalItem('test-key');
      const retrieved = service.getLocalItem('test-key');

      expect(retrieved).toBeNull();
    });
  });

  describe('character encoding handling', () => {
    it('should handle corrupted UTF-8 encoding', () => {
      // Simulate corrupted data that might be in storage
      const corruptedJson = '{"name":"JoÃ£o Silva"}';
      sessionStorage.setItem('corrupted-data', corruptedJson);

      const retrieved = service.getSessionItem('corrupted-data');
      // The service should attempt to fix the encoding
      expect(retrieved.name).not.toBe('JoÃ£o Silva');
    });
  });
});
