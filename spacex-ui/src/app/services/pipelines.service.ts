import { Injectable } from '@angular/core';
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

export interface PipelineRun {
  id: number;
  status: 'queued' | 'running' | 'succeeded' | 'failed';
  trigger_type: 'manual' | 'commit' | 'schedule';
  commit_sha: string;
  initiated_by: string;
  started_at: string | null;
  finished_at: string | null;
  duration_seconds: number;
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
    return this.http.get<PipelineRow[]>('/SpaceX/api/pipelines.php');
  }

  get(id: number) {
    return this.http.get<PipelineDetail>(`/SpaceX/api/pipelines.php?id=${id}`);
  }

  create(name: string, repo: string, defaultBranch: string) {
    return this.http.post('/SpaceX/api/pipelines.php', { action: 'create', name, repo, default_branch: defaultBranch });
  }

  run(id: number) {
    return this.http.post('/SpaceX/api/pipelines.php', { action: 'run', id });
  }
}
