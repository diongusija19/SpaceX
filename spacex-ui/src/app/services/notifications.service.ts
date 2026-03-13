import { Injectable } from '@angular/core';
import { API_BASE } from './api-base';
import { HttpClient } from '@angular/common/http';

export interface NotificationItem {
  id: number;
  message: string;
  is_read: number;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<NotificationItem[]>(`${API_BASE}/notifications.php`);
  }

  markRead(id: number) {
    return this.http.post(`${API_BASE}/notifications.php`, { action: 'mark_read', id });
  }

  markAll() {
    return this.http.post(`${API_BASE}/notifications.php`, { action: 'mark_all' });
  }
}
