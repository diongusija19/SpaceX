import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface UserRow {
  id: number;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<UserRow[]>('/SpaceX/api/users.php');
  }

  updateRole(id: number, role: 'admin' | 'user') {
    return this.http.post('/SpaceX/api/users.php', { id, role });
  }

  create(email: string, password: string, role: 'admin' | 'user') {
    return this.http.post('/SpaceX/api/users.php', { action: 'create', email, password, role });
  }

  resetPassword(id: number, password: string) {
    return this.http.post('/SpaceX/api/users.php', { action: 'reset', id, password });
  }
}
