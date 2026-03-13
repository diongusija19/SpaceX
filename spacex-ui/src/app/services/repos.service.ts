import { Injectable } from '@angular/core';
import { API_BASE } from './api-base';
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
  branch_name: string;
  message: string;
  author: string;
  sha: string;
  created_at: string;
}

export interface RepoBranch {
  id: number;
  name: string;
  created_by: string;
  created_at: string;
}

export interface PullRequest {
  id: number;
  source_branch: string;
  target_branch: string;
  title: string;
  status: 'open' | 'merged' | 'closed';
  created_by: string;
  created_at: string;
}

export interface RepoDetail {
  repo: { id: number; name: string; default_branch: string; created_at: string };
  commits: RepoCommit[];
  branches: RepoBranch[];
  pull_requests: PullRequest[];
}

@Injectable({ providedIn: 'root' })
export class ReposService {
  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<RepoRow[]>(`${API_BASE}/repos.php`);
  }

  get(id: number) {
    return this.http.get<RepoDetail>(`${API_BASE}/repos.php?id=${id}`);
  }

  create(name: string, defaultBranch: string) {
    return this.http.post(`${API_BASE}/repos.php`, { action: 'create', name, default_branch: defaultBranch });
  }

  createBranch(repoId: number, name: string) {
    return this.http.post(`${API_BASE}/repos.php`, { action: 'create_branch', repo_id: repoId, name });
  }

  commit(repoId: number, branchName: string, message: string) {
    return this.http.post(`${API_BASE}/repos.php`, { action: 'commit', repo_id: repoId, branch_name: branchName, message });
  }

  createPr(repoId: number, sourceBranch: string, targetBranch: string, title: string) {
    return this.http.post(`${API_BASE}/repos.php`, {
      action: 'create_pr',
      repo_id: repoId,
      source_branch: sourceBranch,
      target_branch: targetBranch,
      title
    });
  }

  setPrStatus(repoId: number, prId: number, status: 'merged' | 'closed') {
    return this.http.post(`${API_BASE}/repos.php`, { action: 'pr_status', repo_id: repoId, pr_id: prId, status });
  }
}
