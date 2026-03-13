import { Injectable } from '@angular/core';
import { API_BASE } from './api-base';
import { HttpClient } from '@angular/common/http';

export interface Summary {
  total: number;
  running: number;
  stopped: number;
  provisioning: number;
  cost: number;
  types: { vm: number; storage: number; db: number };
}

@Injectable({ providedIn: 'root' })
export class SummaryService {
  constructor(private http: HttpClient) {}

  get() {
    return this.http.get<Summary>(`${API_BASE}/summary.php`);
  }
}
