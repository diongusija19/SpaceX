import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface RepoRow {
  id: number;
  name: string;
  default_branch: string;
  created_at: string;
  last_message: string | null;
  last_author: string | null;
  last_sha: string | null;
  last_commit: string | null;
}

export interface RepoCommit {
  id: number;
  message: string;
  author: string;
  sha: string;
  created_at: string;
}

export interface RepoDetail {
  repo: { id: number; name: string; default_branch: string; created_at: string };
  commits: RepoCommit[];
}

@Injectable({ providedIn: 'root' })
export class ReposService {
  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<RepoRow[]>('/SpaceX/api/repos.php');
  }

  get(id: number) {
    return this.http.get<RepoDetail>(`/SpaceX/api/repos.php?id=${id}`);
  }

  create(name: string, defaultBranch: string) {
    return this.http.post('/SpaceX/api/repos.php', { action: 'create', name, default_branch: defaultBranch });
  }

  commit(repoId: number, message: string) {
    return this.http.post('/SpaceX/api/repos.php', { action: 'commit', repo_id: repoId, message });
  }
}
