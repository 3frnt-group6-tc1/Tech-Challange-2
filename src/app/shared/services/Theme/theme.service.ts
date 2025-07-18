import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, take } from 'rxjs';
import { UserSettingsService } from '../UserSettings/user-settings.service';
import { AuthService, AuthUser } from '../Auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private darkModeClass = 'dark';
  private storageKey = 'darkMode';

  private _isDarkMode$ = new BehaviorSubject<boolean>(false);
  public readonly isDarkMode$ = this._isDarkMode$.asObservable();

  private userSettingsService = inject(UserSettingsService);
  private authService = inject(AuthService);

  constructor() {
    this.loadTheme();
    this.subscribeToUserSettings();
  }

  /**
   * Subscribe to user settings changes to sync theme
   */
  private subscribeToUserSettings(): void {
    this.userSettingsService.userSettings$.subscribe((settings) => {
      if (settings && settings.theme) {
        // Only apply theme from user settings if it's different from current
        const currentTheme = this.getCurrentTheme();
        if (settings.theme !== currentTheme) {
          if (settings.theme === 'dark') {
            this.enableDarkMode();
          } else {
            this.disableDarkMode();
          }
          // Also update localStorage to keep them in sync
          this.saveThemeToLocalStorage(settings.theme);
        }
      }
    });

    // Subscribe to user authentication changes
    this.authService.currentUser$.subscribe((user: AuthUser | null) => {
      if (user) {
        // User logged in - try to load their settings
        this.loadUserThemeSettings(user.id);
      }
      // If user logged out, keep current theme (localStorage will persist it)
    });
  }

  /**
   * Load theme settings for authenticated user
   */
  private loadUserThemeSettings(userId: string): void {
    this.userSettingsService.getUserSettings(userId).subscribe({
      next: (settings) => {
        if (settings.theme) {
          this.setThemeFromUserSettings(settings.theme);
        }
      },
      error: (error) => {
        console.warn(
          'Failed to load user theme settings, keeping current theme:',
          error
        );
        // Continue with current theme (localStorage-based)
      },
    });
  }

  /**
   * Toggle dark mode and sync with user settings if authenticated
   */
  toggleDarkMode(): void {
    const isDark = this.isDarkMode();
    const newTheme = isDark ? 'light' : 'dark';

    // Apply theme change immediately (this will also save to localStorage)
    if (isDark) {
      this.disableDarkMode();
    } else {
      this.enableDarkMode();
    }

    // Try to sync with user settings if authenticated
    this.authService.currentUser$
      .pipe(
        take(1) // Take only the current value to avoid subscription leak
      )
      .subscribe((user: AuthUser | null) => {
        if (user) {
          this.userSettingsService.updateTheme(user.id, newTheme).subscribe({
            next: () => {
              console.log('Theme synchronized with user settings');
            },
            error: (error) => {
              console.warn('Failed to sync theme with user settings:', error);
              // localStorage already saved via enableDarkMode/disableDarkMode, so we continue normally
            },
          });
        }
      });
  }

  /**
   * Save theme preference to local storage
   */
  private saveThemeToLocalStorage(theme: string): void {
    try {
      localStorage.setItem(this.storageKey, theme === 'dark' ? '1' : '0');
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  }

  enableDarkMode(): void {
    document.documentElement.classList.add(this.darkModeClass);
    this._isDarkMode$.next(true);
    // Always keep localStorage in sync
    this.saveThemeToLocalStorage('dark');
  }

  disableDarkMode(): void {
    document.documentElement.classList.remove(this.darkModeClass);
    this._isDarkMode$.next(false);
    // Always keep localStorage in sync
    this.saveThemeToLocalStorage('light');
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

  /**
   * Set theme from user settings (used when user logs in)
   */
  setThemeFromUserSettings(theme: string): void {
    // Only apply if different from current theme
    const currentTheme = this.getCurrentTheme();
    if (theme !== currentTheme) {
      if (theme === 'dark') {
        this.enableDarkMode();
      } else {
        this.disableDarkMode();
      }
    }
  }

  /**
   * Get current theme as string
   */
  getCurrentTheme(): string {
    return this.isDarkMode() ? 'dark' : 'light';
  }
}
