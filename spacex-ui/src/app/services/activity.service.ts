import { Injectable } from '@angular/core';
import { API_BASE } from './api-base';
import { HttpClient } from '@angular/common/http';

export interface ActivityItem {
  id: number;
  action: string;
  timestamp: string;
  resource_name: string;
  user_email: string;
}

@Injectable({ providedIn: 'root' })
export class ActivityService {
  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<ActivityItem[]>(`${API_BASE}/activity.php`);
  }
}
