import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, UserResponse, UsersListResponse } from '../../models/user';
import { apiConfig } from '../../../app.config';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = apiConfig.baseUrl + apiConfig.usersEndpoint;

  constructor(private http: HttpClient) {}

  create(user: User): Observable<User> {
    return this.http
      .post<UserResponse>(this.apiUrl, user)
      .pipe(map((response) => response.result));
  }

  read(userId: string): Observable<User> {
    return this.http
      .get<UserResponse>(`${this.apiUrl}/${userId}`)
      .pipe(map((response) => response.result));
  }

  update(userId: string, user: User): Observable<User> {
    return this.http
      .put<UserResponse>(`${this.apiUrl}/${userId}`, user)
      .pipe(map((response) => response.result));
  }

  delete(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}`);
  }

  getAll(): Observable<User[]> {
    return this.http
      .get<UsersListResponse>(this.apiUrl)
      .pipe(map((response) => response.result));
  }

  getById(userId: string): Observable<User> {
    return this.http
      .get<UserResponse>(`${this.apiUrl}/${userId}`)
      .pipe(map((response) => response.result));
  }
}
