import { Injectable } from '@angular/core';
import { API_BASE } from './api-base';
import { HttpClient, HttpParams } from '@angular/common/http';

export interface Resource {
  id: number;
  name: string;
  type: string;
  region: string;
  status: string;
  size: string;
  created_at: string;
}

export interface ResourceDetail {
  resource: Resource;
  usage: { hours: number; cost: number };
  alerts: Array<{ id: number; severity: string; message: string; created_at: string; resolved: number }>;
}

@Injectable({ providedIn: 'root' })
export class ResourcesService {
  constructor(private http: HttpClient) {}

  list(filters: { type?: string; status?: string; region?: string } = {}) {
    let params = new HttpParams();
    if (filters.type) params = params.set('type', filters.type);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.region) params = params.set('region', filters.region);
    return this.http.get<Resource[]>(`${API_BASE}/resources.php`, { params });
  }

  create(payload: { name: string; type: string; region: string; size: string }) {
    return this.http.post<{ id: number }>(`${API_BASE}/resources.php`, payload);
  }

  get(id: number) {
    return this.http.get<ResourceDetail>(`${API_BASE}/resource.php?id=${id}`);
  }

  action(id: number, action: 'start' | 'stop' | 'delete') {
    return this.http.post(`${API_BASE}/resource_action.php`, { id, action });
  }
}
