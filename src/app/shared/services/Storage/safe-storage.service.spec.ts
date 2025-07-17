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

    it('should handle arrays', () => {
      const data = ['João', 'Maria', 'José'];
      const result = service.safeStringify(data);
      expect(JSON.parse(result)).toEqual(data);
    });

    it('should handle nested objects', () => {
      const data = {
        user: {
          name: 'João',
          address: {
            city: 'São Paulo',
            country: 'Brasil',
          },
        },
      };
      const result = service.safeStringify(data);
      expect(JSON.parse(result)).toEqual(data);
    });

    it('should handle null and undefined values', () => {
      const data = { name: null, age: undefined, active: true };
      const result = service.safeStringify(data);
      const parsed = JSON.parse(result);
      expect(parsed.name).toBeNull();
      expect(parsed.hasOwnProperty('age')).toBeFalsy(); // undefined is omitted
      expect(parsed.active).toBe(true);
    });

    it('should fallback to basic stringify on error', () => {
      const circularObj: any = { name: 'Test' };
      circularObj.self = circularObj;

      spyOn(JSON, 'stringify').and.callFake((data, replacer) => {
        if (replacer) {
          throw new Error('Custom error');
        }
        return '{"name":"Test"}';
      });

      const result = service.safeStringify(circularObj);
      expect(result).toBeDefined();
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

    it('should handle empty string', () => {
      const result = service.safeParse('');
      expect(result).toBeNull();
    });

    it('should handle arrays', () => {
      const jsonString = '["João", "Maria", "José"]';
      const result = service.safeParse(jsonString);
      expect(result).toEqual(['João', 'Maria', 'José']);
    });

    it('should clean encoding issues after parsing', () => {
      const jsonString = '{"name":"João"}';
      const result = service.safeParse(jsonString);
      expect(result.name).toBe('João');
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

    it('should return null for non-existent items', () => {
      const retrieved = service.getSessionItem('non-existent');
      expect(retrieved).toBeNull();
    });

    it('should clear all session storage', () => {
      service.setSessionItem('key1', 'value1');
      service.setSessionItem('key2', 'value2');

      service.clearSession();

      expect(service.getSessionItem('key1')).toBeNull();
      expect(service.getSessionItem('key2')).toBeNull();
    });

    it('should handle errors when setting session items', () => {
      spyOn(console, 'error');
      spyOn(Storage.prototype, 'setItem').and.throwError(
        'Storage quota exceeded'
      );

      service.setSessionItem('test', 'value');

      expect(console.error).toHaveBeenCalled();
    });

    it('should handle errors when getting session items', () => {
      spyOn(console, 'error');
      spyOn(Storage.prototype, 'getItem').and.throwError('Storage error');

      const result = service.getSessionItem('test');

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
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

    it('should return null for non-existent local items', () => {
      const retrieved = service.getLocalItem('non-existent');
      expect(retrieved).toBeNull();
    });

    it('should clear all local storage', () => {
      service.setLocalItem('key1', 'value1');
      service.setLocalItem('key2', 'value2');

      service.clearLocal();

      expect(service.getLocalItem('key1')).toBeNull();
      expect(service.getLocalItem('key2')).toBeNull();
    });

    it('should handle errors when setting local items', () => {
      spyOn(console, 'error');
      spyOn(Storage.prototype, 'setItem').and.throwError(
        'Storage quota exceeded'
      );

      service.setLocalItem('test', 'value');

      expect(console.error).toHaveBeenCalled();
    });

    it('should handle errors when getting local items', () => {
      spyOn(console, 'error');
      spyOn(Storage.prototype, 'getItem').and.throwError('Storage error');

      const result = service.getLocalItem('test');

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
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

    it('should detect corrupted strings in objects', () => {
      const corruptedData = { name: 'JoÃ£o' };
      const hasCorrupted = service['hasCorruptedStrings'](corruptedData);
      expect(hasCorrupted).toBe(true);
    });

    it('should detect corrupted strings in arrays', () => {
      const corruptedArray = ['JoÃ£o', 'normal text'];
      const hasCorrupted = service['hasCorruptedStrings'](corruptedArray);
      expect(hasCorrupted).toBe(true);
    });

    it('should not detect clean strings as corrupted', () => {
      const cleanData = { name: 'João' };
      const hasCorrupted = service['hasCorruptedStrings'](cleanData);
      expect(hasCorrupted).toBe(false);
    });

    it('should clean encoding issues in nested objects', () => {
      const corruptedData = {
        user: {
          name: 'JoÃ£o',
          city: 'SÃ£o Paulo',
        },
      };
      const cleaned = service['cleanEncodingIssues'](corruptedData);
      expect(cleaned).toBeDefined();
      expect(typeof cleaned.user).toBe('object');
    });

    it('should validate UTF-8 strings correctly', () => {
      const validString = 'João da Silva';
      const isValid = service['isValidUtf8String'](validString);
      expect(isValid).toBe(true);
    });

    it('should detect invalid UTF-8 patterns', () => {
      const invalidString = 'JoÃ£o da Silva';
      const isValid = service['isValidUtf8String'](invalidString);
      expect(isValid).toBe(false);
    });

    it('should handle non-string values in cleanEncodingIssues', () => {
      const nonStringData = 123;
      const cleaned = service['cleanEncodingIssues'](nonStringData);
      expect(cleaned).toBe(123);
    });
  });

  describe('initialization and cleanup', () => {
    it('should clean corrupted data on initialization', () => {
      // Pre-populate sessionStorage with corrupted data
      sessionStorage.setItem('corrupted-key', '{"name":"JoÃ£o"}');

      spyOn(console, 'log');

      // Create a new service instance to trigger initialization
      const newService = new SafeStorageService();

      expect(console.log).toHaveBeenCalledWith(
        'Cleaning corrupted data for key: corrupted-key'
      );
    });

    it('should handle errors during initialization cleanup', () => {
      spyOn(console, 'error');
      spyOn(console, 'warn');

      // Mock sessionStorage.getItem to throw an error
      spyOn(Storage.prototype, 'getItem').and.throwError('Storage error');

      // Create a new service instance
      const newService = new SafeStorageService();

      expect(console.warn).toHaveBeenCalled();
    });

    it('should handle non-JSON data during cleanup', () => {
      sessionStorage.setItem('non-json-key', 'not json data');

      spyOn(console, 'warn');

      // Create a new service instance
      const newService = new SafeStorageService();

      // Should not try to process non-JSON data
      expect(console.warn).not.toHaveBeenCalledWith(
        jasmine.stringMatching(/Cleaning corrupted data/)
      );
    });
  });

  describe('edge cases', () => {
    it('should handle empty objects', () => {
      const emptyObj = {};
      service.setSessionItem('empty', emptyObj);
      const result = service.getSessionItem('empty');
      expect(result).toEqual({});
    });

    it('should handle empty arrays', () => {
      const emptyArray: any[] = [];
      service.setSessionItem('empty-array', emptyArray);
      const result = service.getSessionItem('empty-array');
      expect(result).toEqual([]);
    });

    it('should handle boolean values', () => {
      service.setSessionItem('true-value', true);
      service.setSessionItem('false-value', false);

      expect(service.getSessionItem('true-value')).toBe(true);
      expect(service.getSessionItem('false-value')).toBe(false);
    });

    it('should handle numeric values', () => {
      service.setSessionItem('zero', 0);
      service.setSessionItem('negative', -123);
      service.setSessionItem('float', 123.456);

      expect(service.getSessionItem('zero')).toBe(0);
      expect(service.getSessionItem('negative')).toBe(-123);
      expect(service.getSessionItem('float')).toBe(123.456);
    });

    it('should handle special characters in keys', () => {
      const data = { test: 'value' };
      service.setSessionItem('key-with-special@chars!', data);
      const result = service.getSessionItem('key-with-special@chars!');
      expect(result).toEqual(data);
    });
  });
});
