import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { UserSettings } from '../../models/user';
import { apiConfig } from '../../../app.config';

export interface UserSettingsResponse {
  message: string;
  result: UserSettings;
}

@Injectable({
  providedIn: 'root',
})
export class UserSettingsService {
  private apiUrl = apiConfig.baseUrl + apiConfig.usersEndpoint;
  private _userSettings$ = new BehaviorSubject<UserSettings | null>(null);

  public readonly userSettings$ = this._userSettings$.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Busca as configurações do usuário por ID
   */
  getUserSettings(userId: string): Observable<UserSettings> {
    return this.http
      .get<UserSettingsResponse>(`${this.apiUrl}/${userId}/settings`)
      .pipe(
        map((response) => response.result),
        tap((settings) => this._userSettings$.next(settings))
      );
  }

  /**
   * Atualiza as configurações do usuário
   */
  updateUserSettings(
    userId: string,
    settings: Partial<UserSettings>
  ): Observable<UserSettings> {
    return this.http
      .put<UserSettingsResponse>(`${this.apiUrl}/${userId}/settings`, settings)
      .pipe(
        map((response) => response.result),
        tap((updatedSettings) => this._userSettings$.next(updatedSettings))
      );
  }

  /**
   * Obtém as configurações atuais em cache
   */
  getCurrentSettings(): UserSettings | null {
    return this._userSettings$.value;
  }

  /**
   * Limpa o cache das configurações
   */
  clearSettings(): void {
    this._userSettings$.next(null);
  }

  /**
   * Configurações padrão para novos usuários
   */
  getDefaultSettings(): UserSettings {
    return {
      notifications: true,
      language: 'pt-BR',
      currency: 'BRL',
      twoFactorAuth: false,
      emailAlerts: true,
      smsAlerts: false,
      theme: 'light',
    };
  }

  /**
   * Atualiza apenas o tema do usuário
   */
  updateTheme(userId: string, theme: string): Observable<UserSettings> {
    const currentSettings =
      this.getCurrentSettings() || this.getDefaultSettings();
    return this.updateUserSettings(userId, { ...currentSettings, theme });
  }

  /**
   * Atualiza apenas as notificações do usuário
   */
  updateNotifications(
    userId: string,
    notifications: boolean
  ): Observable<UserSettings> {
    const currentSettings =
      this.getCurrentSettings() || this.getDefaultSettings();
    return this.updateUserSettings(userId, {
      ...currentSettings,
      notifications,
    });
  }

  /**
   * Atualiza apenas o idioma do usuário
   */
  updateLanguage(userId: string, language: string): Observable<UserSettings> {
    const currentSettings =
      this.getCurrentSettings() || this.getDefaultSettings();
    return this.updateUserSettings(userId, { ...currentSettings, language });
  }
}
