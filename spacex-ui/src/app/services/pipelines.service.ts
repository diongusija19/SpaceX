import { Injectable } from '@angular/core';
import { API_BASE } from './api-base';
import { HttpClient } from '@angular/common/http';

export interface PipelineRow {
  id: number;
  name: string;
  repo: string;
  default_branch: string;
  created_at: string;
  last_status: 'queued' | 'running' | 'succeeded' | 'failed' | null;
  last_started: string | null;
  last_finished: string | null;
}

export interface PipelineStage {
  name: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed';
  duration_seconds: number;
}

export interface PipelineRun {
  id: number;
  status: 'queued' | 'running' | 'succeeded' | 'failed';
  trigger_type: 'manual' | 'commit' | 'schedule';
  commit_sha: string;
  initiated_by: string;
  started_at: string | null;
  finished_at: string | null;
  duration_seconds: number;
  stages: PipelineStage[];
  log_output: string;
}

export interface PipelineDetail {
  pipeline: {
    id: number;
    name: string;
    repo: string;
    default_branch: string;
    created_at: string;
  };
  runs: PipelineRun[];
}

@Injectable({ providedIn: 'root' })
export class PipelinesService {
  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<PipelineRow[]>(`${API_BASE}/pipelines.php`);
  }

  get(id: number) {
    return this.http.get<PipelineDetail>(`${API_BASE}/pipelines.php?id=${id}`);
  }

  create(name: string, repo: string, defaultBranch: string) {
    return this.http.post(`${API_BASE}/pipelines.php`, { action: 'create', name, repo, default_branch: defaultBranch });
  }

  run(id: number, shouldFail = false) {
    return this.http.post(`${API_BASE}/pipelines.php`, { action: 'run', id, should_fail: shouldFail });
  }
}
