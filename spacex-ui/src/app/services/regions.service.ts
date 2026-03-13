import { Injectable } from '@angular/core';
import { API_BASE } from './api-base';
import { HttpClient } from '@angular/common/http';

export interface RegionSummary {
  region: string;
  total: number;
  running: number;
  stopped: number;
  provisioning: number;
}

@Injectable({ providedIn: 'root' })
export class RegionsService {
  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<RegionSummary[]>(`${API_BASE}/regions.php`);
  }
}
