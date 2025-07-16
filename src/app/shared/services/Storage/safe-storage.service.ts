import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SafeStorageService {
  constructor() {
    this.cleanAllCorruptedData();
  }

  /**
   * Clean all corrupted data on service initialization
   */
  private cleanAllCorruptedData(): void {
    try {
      // Get all keys from sessionStorage
      const keys = Object.keys(sessionStorage);

      keys.forEach((key) => {
        try {
          const data = sessionStorage.getItem(key);
          if (data && this.isJsonString(data)) {
            const parsedData = JSON.parse(data);

            if (this.hasCorruptedStrings(parsedData)) {
              console.log(`Cleaning corrupted data for key: ${key}`);
              const cleanedData = this.cleanEncodingIssues(parsedData);
              sessionStorage.setItem(key, JSON.stringify(cleanedData));
            }
          }
        } catch (error) {
          console.warn(`Could not process sessionStorage key: ${key}`, error);
        }
      });
    } catch (error) {
      console.error('Error cleaning corrupted session data:', error);
    }
  }

  /**
   * Check if a string is valid JSON
   */
  private isJsonString(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Safely stringify data with proper character encoding
   */
  safeStringify(data: any): string {
    try {
      // First, ensure the data is properly decoded if it was double-encoded
      const cleanData = this.cleanEncodingIssues(data);

      // Use JSON.stringify with proper character handling
      return JSON.stringify(cleanData, (key, value) => {
        if (typeof value === 'string') {
          // Normalize to ensure consistent Unicode representation
          return value.normalize('NFC');
        }
        return value;
      });
    } catch (error) {
      console.error('Error stringifying data:', error);
      // Fallback to basic stringify if the enhanced version fails
      return JSON.stringify(data);
    }
  }

  /**
   * Safely parse JSON with proper character handling
   */
  safeParse(jsonString: string): any {
    try {
      const parsed = JSON.parse(jsonString);
      // Clean any encoding issues in the parsed data
      return this.cleanEncodingIssues(parsed);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return null;
    }
  }

  /**
   * Set item in sessionStorage with safe encoding
   */
  setSessionItem(key: string, data: any): void {
    try {
      const safeData = this.safeStringify(data);
      sessionStorage.setItem(key, safeData);
    } catch (error) {
      console.error(`Error setting session item ${key}:`, error);
    }
  }

  /**
   * Get item from sessionStorage with safe parsing
   */
  getSessionItem<T = any>(key: string): T | null {
    try {
      const data = sessionStorage.getItem(key);
      return data ? this.safeParse(data) : null;
    } catch (error) {
      console.error(`Error getting session item ${key}:`, error);
      return null;
    }
  }

  /**
   * Set item in localStorage with safe encoding
   */
  setLocalItem(key: string, data: any): void {
    try {
      const safeData = this.safeStringify(data);
      localStorage.setItem(key, safeData);
    } catch (error) {
      console.error(`Error setting local item ${key}:`, error);
    }
  }

  /**
   * Get item from localStorage with safe parsing
   */
  getLocalItem<T = any>(key: string): T | null {
    try {
      const data = localStorage.getItem(key);
      return data ? this.safeParse(data) : null;
    } catch (error) {
      console.error(`Error getting local item ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove item from sessionStorage
   */
  removeSessionItem(key: string): void {
    sessionStorage.removeItem(key);
  }

  /**
   * Remove item from localStorage
   */
  removeLocalItem(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * Clear all sessionStorage
   */
  clearSession(): void {
    sessionStorage.clear();
  }

  /**
   * Clear all localStorage
   */
  clearLocal(): void {
    localStorage.clear();
  }

  /**
   * Clean encoding issues from data (fix double UTF-8 encoding)
   */
  private cleanEncodingIssues(data: any): any {
    if (typeof data === 'string') {
      try {
        // Check if the string contains double-encoded UTF-8 characters
        // This fixes issues like "JoÃ£o" back to "João"
        const bytes = new Uint8Array(data.length);
        for (let i = 0; i < data.length; i++) {
          bytes[i] = data.charCodeAt(i);
        }

        // Try to decode as UTF-8
        const decoded = new TextDecoder('utf-8').decode(bytes);

        // If decoding produces different result and looks more correct, use it
        if (decoded !== data && this.isValidUtf8String(decoded)) {
          return decoded;
        }

        return data;
      } catch (error) {
        // If decoding fails, return original string
        return data;
      }
    } else if (typeof data === 'object' && data !== null) {
      // Recursively clean objects and arrays
      if (Array.isArray(data)) {
        return data.map((item) => this.cleanEncodingIssues(item));
      } else {
        const cleaned: any = {};
        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            cleaned[key] = this.cleanEncodingIssues(data[key]);
          }
        }
        return cleaned;
      }
    }

    return data;
  }

  /**
   * Check if a string contains valid UTF-8 characters
   */
  private isValidUtf8String(str: string): boolean {
    try {
      // Check if string contains common Portuguese/accented characters
      const accentedChars =
        /[àáâãäåçèéêëìíîïñòóôõöùúûüýÿÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝŸ]/;

      // If it has accented characters and they look normal (not garbled), it's likely correct
      if (accentedChars.test(str)) {
        // Check for common double-encoding patterns
        const doubleEncodingPattern = /Ã[£¡¢¤¥§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿]/;
        return !doubleEncodingPattern.test(str);
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if an object contains corrupted string values
   */
  private hasCorruptedStrings(obj: any): boolean {
    if (typeof obj === 'string') {
      // Check for common double-encoding patterns like "JoÃ£o"
      const doubleEncodingPattern = /Ã[£¡¢¤¥§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿]/;
      return doubleEncodingPattern.test(obj);
    }

    if (typeof obj === 'object' && obj !== null) {
      if (Array.isArray(obj)) {
        return obj.some((item) => this.hasCorruptedStrings(item));
      } else {
        return Object.values(obj).some((value) =>
          this.hasCorruptedStrings(value)
        );
      }
    }

    return false;
  }
}
