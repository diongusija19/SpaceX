import { Injectable } from '@angular/core';
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
    return this.http.get<NotificationItem[]>('/SpaceX/api/notifications.php');
  }

  markRead(id: number) {
    return this.http.post('/SpaceX/api/notifications.php', { action: 'mark_read', id });
  }

  markAll() {
    return this.http.post('/SpaceX/api/notifications.php', { action: 'mark_all' });
  }
}
