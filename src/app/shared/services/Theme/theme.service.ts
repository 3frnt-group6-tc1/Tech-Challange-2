import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private darkModeClass = 'dark';
  private storageKey = 'darkMode';

  constructor() {
    this.loadTheme();
  }

  toggleDarkMode(): void {
    const isDark = this.isDarkMode();
    if (isDark) {
      this.disableDarkMode();
      try {
        localStorage.setItem(this.storageKey, '0');
      } catch (error) {
        // Continue without localStorage if not available
      }
    } else {
      this.enableDarkMode();
      try {
        localStorage.setItem(this.storageKey, '1');
      } catch (error) {
        // Continue without localStorage if not available
      }
    }
  }

  enableDarkMode(): void {
    document.documentElement.classList.add(this.darkModeClass);
    try {
      localStorage.setItem(this.storageKey, '1');
    } catch (error) {
      // Continue without localStorage if not available
    }
  }

  disableDarkMode(): void {
    document.documentElement.classList.remove(this.darkModeClass);
    try {
      localStorage.setItem(this.storageKey, '0');
    } catch (error) {
      // Continue without localStorage if not available
    }
  }

  isDarkMode(): boolean {
    return document.documentElement.classList.contains(this.darkModeClass);
  }

  loadTheme(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);

      if (stored === '1') {
        this.enableDarkMode();
      } else if (stored === '0') {
        this.disableDarkMode();
      } else {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          this.enableDarkMode();
        } else {
          this.disableDarkMode();
        }
      }
    } catch (error) {
      // Fallback to system preference if localStorage is not available
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        this.enableDarkMode();
      } else {
        this.disableDarkMode();
      }
    }
  }
}
