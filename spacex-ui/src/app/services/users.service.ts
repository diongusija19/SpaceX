import { Injectable } from '@angular/core';
import { API_BASE } from './api-base';
import { HttpClient } from '@angular/common/http';

export interface UserRow {
  id: number;
  email: string;
  role: 'admin' | 'user';
  team: string;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<UserRow[]>(`${API_BASE}/users.php`);
  }

  updateRole(id: number, role: 'admin' | 'user') {
    return this.http.post(`${API_BASE}/users.php`, { id, role });
  }

  create(email: string, password: string, role: 'admin' | 'user', team: string) {
    return this.http.post(`${API_BASE}/users.php`, { action: 'create', email, password, role, team });
  }

  resetPassword(id: number, password: string) {
    return this.http.post(`${API_BASE}/users.php`, { action: 'reset', id, password });
  }

  updateTeam(id: number, team: string) {
    return this.http.post(`${API_BASE}/users.php`, { action: 'set_team', id, team });
  }
}
