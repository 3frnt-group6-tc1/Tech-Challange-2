import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import {
  UserSettingsService,
  UserSettingsResponse,
} from './user-settings.service';
import { UserSettings } from '../../models/user';
import { apiConfig } from '../../../app.config';

describe('UserSettingsService', () => {
  let service: UserSettingsService;
  let httpMock: HttpTestingController;
  const apiUrl = apiConfig.baseUrl + apiConfig.usersEndpoint;

  const mockUserSettings: UserSettings = {
    notifications: true,
    language: 'pt-BR',
    currency: 'BRL',
    twoFactorAuth: false,
    emailAlerts: true,
    smsAlerts: false,
    theme: 'light',
  };

  const mockResponse: UserSettingsResponse = {
    message: 'Configurações encontradas com sucesso',
    result: mockUserSettings,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserSettingsService],
    });
    service = TestBed.inject(UserSettingsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUserSettings', () => {
    it('should fetch user settings and update behavior subject', () => {
      const userId = 'test-user-id';

      service.getUserSettings(userId).subscribe((settings) => {
        expect(settings).toEqual(mockUserSettings);
      });

      const req = httpMock.expectOne(`${apiUrl}/${userId}/settings`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);

      // Verify that the behavior subject was updated
      service.userSettings$.subscribe((settings) => {
        expect(settings).toEqual(mockUserSettings);
      });
    });
  });

  describe('updateUserSettings', () => {
    it('should update user settings and update behavior subject', () => {
      const userId = 'test-user-id';
      const updatedSettings: Partial<UserSettings> = {
        theme: 'dark',
        notifications: false,
      };

      const expectedUpdatedSettings: UserSettings = {
        ...mockUserSettings,
        ...updatedSettings,
      };

      const updateResponse: UserSettingsResponse = {
        message: 'Configurações atualizadas com sucesso',
        result: expectedUpdatedSettings,
      };

      service
        .updateUserSettings(userId, updatedSettings)
        .subscribe((settings) => {
          expect(settings).toEqual(expectedUpdatedSettings);
        });

      const req = httpMock.expectOne(`${apiUrl}/${userId}/settings`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedSettings);
      req.flush(updateResponse);

      // Verify that the behavior subject was updated
      service.userSettings$.subscribe((settings) => {
        expect(settings).toEqual(expectedUpdatedSettings);
      });
    });
  });

  describe('updateTheme', () => {
    it('should update only the theme setting', () => {
      const userId = 'test-user-id';
      const newTheme = 'dark';

      // Set initial settings
      service['_userSettings$'].next(mockUserSettings);

      const expectedSettings: UserSettings = {
        ...mockUserSettings,
        theme: newTheme,
      };

      const updateResponse: UserSettingsResponse = {
        message: 'Configurações atualizadas com sucesso',
        result: expectedSettings,
      };

      service.updateTheme(userId, newTheme).subscribe((settings) => {
        expect(settings.theme).toBe(newTheme);
      });

      const req = httpMock.expectOne(`${apiUrl}/${userId}/settings`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(expectedSettings);
      req.flush(updateResponse);
    });
  });

  describe('getCurrentSettings', () => {
    it('should return current settings from behavior subject', () => {
      service['_userSettings$'].next(mockUserSettings);

      const currentSettings = service.getCurrentSettings();
      expect(currentSettings).toEqual(mockUserSettings);
    });

    it('should return null when no settings are cached', () => {
      const currentSettings = service.getCurrentSettings();
      expect(currentSettings).toBeNull();
    });
  });

  describe('getDefaultSettings', () => {
    it('should return default settings', () => {
      const defaultSettings = service.getDefaultSettings();

      expect(defaultSettings).toEqual({
        notifications: true,
        language: 'pt-BR',
        currency: 'BRL',
        twoFactorAuth: false,
        emailAlerts: true,
        smsAlerts: false,
        theme: 'light',
      });
    });
  });

  describe('clearSettings', () => {
    it('should clear the settings cache', () => {
      service['_userSettings$'].next(mockUserSettings);

      service.clearSettings();

      service.userSettings$.subscribe((settings) => {
        expect(settings).toBeNull();
      });
    });
  });
});
